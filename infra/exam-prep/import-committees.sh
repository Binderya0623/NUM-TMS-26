#!/usr/bin/env bash
# =============================================================
# import-committees.sh STAGE
#   STAGE ∈ PROGRESS_2 | PRE_DEFENSE | FINAL_DEFENSE
#
# Reads infra/exam-prep/out/committees-<STAGE>.json (rich schema):
#
# {
#   "stageType":       "PROGRESS_2",
#   "name":            "Комисс 1",
#   "scheduledDate":   "2026-04-20T09:20:00",
#   "location":        "8-р байр 204 тоот",
#   "status":          "CLOSED" | "ACTIVE",
#   "head":            "<teacher email-prefix>" | null,
#   "secretary":       "<teacher email-prefix>" | null,
#   "members":         ["<teacher email-prefix>", ...],
#   "externalExperts": ["<expert email-prefix>", ...],   // see note
#   "students": [
#     { "sisiId": "22B1NUM4505", "score": 18.0 }, ...
#   ]
# }
#
# For each committee:
#   1) POST /api/committees                                        (create)
#   2) POST /api/committee-teachers (HEAD, SECRETARY, MEMBER, EXTERNAL_EXPERT)
#   3) POST /api/committees/{id}/students                          (per student)
#   4) POST workflow_service /api/defense-sessions                 (date + location)
#   5) If status == CLOSED:
#        a) for each (sid, score) seed evaluation_service /api/final-grades
#        b) PATCH /api/defense-sessions/{id}/close
#        c) PATCH /api/committees/{id}/close
#
# Notes on externalExperts: each entry must already exist in
# user_service either as a TEACHER or EXTERNAL_EXPERT. Untranslated
# Cyrillic shortnames will be skipped with a warning.
# =============================================================
# NOTE: deliberately not using `set -e`. The committee-creation loop must
# carry on after a single failed row (a missing teacher, a duplicate name,
# a backend 500 …). `set -u` is also off because macOS bash 3.2 treats
# `${!arr[@]}` on an empty array as an unbound variable — which used to
# kill the loop on the first committee that had no graded students. The
# script still aborts on bad pipeline status (`pipefail`).
set -o pipefail

STAGE="${1:?usage: $0 PROGRESS_2|PRE_DEFENSE|FINAL_DEFENSE}"
case "$STAGE" in PROGRESS_2|PRE_DEFENSE|FINAL_DEFENSE);; *) echo "bad stage: $STAGE"; exit 1;; esac

COMM_API="${COMM_API:-http://localhost:8082}"
WF_API="${WF_API:-http://localhost:8084}"
USER_API="${USER_API:-http://localhost:8086}"
EVAL_API="${EVAL_API:-http://localhost:8085}"

HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$HERE/out/committees-$STAGE.json"

[ -f "$SRC" ] || { echo "missing $SRC — run build-stage-jsons.py"; exit 1; }
command -v jq   >/dev/null || { echo "jq required";   exit 1; }
command -v curl >/dev/null || { echo "curl required"; exit 1; }

# ── 1) Build email-prefix → UUID maps for teachers, experts, students ────────
TEA=$(mktemp); EXP=$(mktemp); STU=$(mktemp)
trap 'rm -f "$TEA" "$EXP" "$STU"' EXIT
curl -sS "$USER_API/api/users/teachers" \
  | jq -r '.[] | "\((.email // "" | split("@")[0]) | ascii_downcase)\t\(.id)"' > "$TEA"
curl -sS "$USER_API/api/users/external-experts" \
  | jq -r '.[] | "\((.email // "" | split("@")[0]) | ascii_downcase)\t\(.id)"' > "$EXP"
curl -sS "$USER_API/api/users/students" \
  | jq -r '.[] | "\((.email // "" | split("@")[0]) | ascii_downcase)\t\(.id)"' > "$STU"

resolve_in() {
  awk -F '\t' -v k="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')" \
      '$1==k {print $2; exit}' "$2"
}
resolve_teacher() { resolve_in "$1" "$TEA"; }
resolve_expert()  { resolve_in "$1" "$EXP"; }
resolve_student() { resolve_in "$1" "$STU"; }

# ── 2) Map a stage type to its corresponding final-grades score field ────────
# PROGRESS_2 → progress2Score (max 20)
# PRE_DEFENSE → preliminaryScore (max 25)
# FINAL_DEFENSE → finalCommitteeScore (max 35) — but final stays ACTIVE so unused
case "$STAGE" in
  PROGRESS_2)    SCORE_KEY="progress2Score";    STAGE_MAX=20 ;;
  PRE_DEFENSE)   SCORE_KEY="preliminaryScore";  STAGE_MAX=25 ;;
  FINAL_DEFENSE) SCORE_KEY="finalCommitteeScore"; STAGE_MAX=35 ;;
esac

made=0; t_added=0; s_added=0; closed=0; graded=0; skipped=0

while IFS= read -r cmt; do
  NAME=$(jq -r '.name'           <<<"$cmt")
  STAGE_TYPE=$(jq -r '.stageType' <<<"$cmt")
  SCHEDULED=$(jq -r '.scheduledDate' <<<"$cmt")
  LOC=$(jq -r '.location'        <<<"$cmt")
  STATUS=$(jq -r '.status'       <<<"$cmt")

  # 2a) Create committee
  RES=$(curl -sS -X POST "$COMM_API/api/committees" \
              -H 'Content-Type: application/json' \
              -d "$(jq -cn --arg n "$NAME" --arg t "$STAGE_TYPE" \
                       '{name:$n, defenseType:$t, departmentId:""}')")
  CID=$(jq -r '.id // empty' <<<"$RES")
  if [ -z "$CID" ]; then
    echo "  ERR creating $NAME: $RES"; skipped=$((skipped+1)); continue
  fi
  echo "✓ committee '$NAME' [$CID] status=$STATUS"
  made=$((made+1))

  # Track these so we can seed defense_grade + secretary_submission later.
  HEAD_ID=""; SECRETARY_ID=""

  # 2b) Add HEAD
  HEAD_PRE=$(jq -r '.head // empty' <<<"$cmt")
  if [ -n "$HEAD_PRE" ]; then
    USER_ID=$(resolve_teacher "$HEAD_PRE")
    if [ -n "$USER_ID" ]; then
      HEAD_ID="$USER_ID"
      curl -sS -X POST "$COMM_API/api/committee-teachers" \
        -H 'Content-Type: application/json' \
        -d "$(jq -cn --arg c "$CID" --arg u "$USER_ID" \
                '{committeeId:$c, teacherId:$u, role:"HEAD"}')" > /dev/null
      t_added=$((t_added+1))
    else
      echo "    ↳ HEAD '$HEAD_PRE' not in teachers — skipped"
    fi
  fi

  # Add SECRETARY
  SEC_PRE=$(jq -r '.secretary // empty' <<<"$cmt")
  if [ -n "$SEC_PRE" ]; then
    USER_ID=$(resolve_teacher "$SEC_PRE")
    if [ -n "$USER_ID" ]; then
      SECRETARY_ID="$USER_ID"
      curl -sS -X POST "$COMM_API/api/committee-teachers" \
        -H 'Content-Type: application/json' \
        -d "$(jq -cn --arg c "$CID" --arg u "$USER_ID" \
                '{committeeId:$c, teacherId:$u, role:"SECRETARY"}')" > /dev/null
      t_added=$((t_added+1))
    else
      echo "    ↳ SECRETARY '$SEC_PRE' not in teachers — skipped"
    fi
  fi

  # Add MEMBERS
  for m_pre in $(jq -r '.members[]?' <<<"$cmt"); do
    USER_ID=$(resolve_teacher "$m_pre")
    if [ -n "$USER_ID" ]; then
      curl -sS -X POST "$COMM_API/api/committee-teachers" \
        -H 'Content-Type: application/json' \
        -d "$(jq -cn --arg c "$CID" --arg u "$USER_ID" \
                '{committeeId:$c, teacherId:$u, role:"MEMBER"}')" > /dev/null
      t_added=$((t_added+1))
    else
      echo "    ↳ MEMBER '$m_pre' not in teachers — skipped"
    fi
  done

  # Add EXTERNAL_EXPERTs (try expert pool first, fall back to teachers)
  for e_pre in $(jq -r '.externalExperts[]?' <<<"$cmt"); do
    USER_ID=$(resolve_expert "$e_pre"); [ -z "$USER_ID" ] && USER_ID=$(resolve_teacher "$e_pre")
    if [ -n "$USER_ID" ]; then
      curl -sS -X POST "$COMM_API/api/committee-teachers" \
        -H 'Content-Type: application/json' \
        -d "$(jq -cn --arg c "$CID" --arg u "$USER_ID" \
                '{committeeId:$c, teacherId:$u, role:"EXTERNAL_EXPERT"}')" > /dev/null
      t_added=$((t_added+1))
    else
      echo "    ↳ EXTERNAL_EXPERT '$e_pre' not in user_service — skipped (edit JSON to use a registered email-prefix)"
    fi
  done

  # 2c) Assign students + collect (UUID, score) for grade seeding.
  SEED_UIDS=()
  SEED_SCORES=()
  while IFS= read -r srow; do
    SID_RAW=$(jq -r '.sisiId' <<<"$srow")
    SCORE=$(jq -r '.score // empty' <<<"$srow")
    USER_ID=$(resolve_student "$SID_RAW")
    if [ -z "$USER_ID" ]; then
      echo "    ↳ skip — student $SID_RAW not in user_service"; continue
    fi
    curl -sS -X POST "$COMM_API/api/committees/$CID/students" \
      -H 'Content-Type: application/json' \
      -d "$(jq -cn --arg s "$USER_ID" '{studentId:$s}')" > /dev/null
    s_added=$((s_added+1))
    if [ -n "$SCORE" ]; then
      SEED_UIDS+=("$USER_ID")
      SEED_SCORES+=("$SCORE")
    fi
  done < <(jq -c '.students[]' <<<"$cmt")

  # 2d) Create defense session
  SESS_RES=$(curl -sS -X POST "$WF_API/api/defense-sessions" \
              -H 'Content-Type: application/json' \
              -d "$(jq -cn --arg c "$CID" --arg t "$STAGE_TYPE" \
                            --arg d "$SCHEDULED" --arg loc "$LOC" \
                       '{committeeId:$c, stageType:$t, scheduledDate:$d, location:$loc}')")
  SID=$(jq -r '.id // empty' <<<"$SESS_RES")

  # 2e) For CLOSED stages: seed grades + close session + close committee.
  if [ "$STATUS" = "CLOSED" ]; then
    # Seed graded students (the array may be empty for committees whose
    # roster lacks scores — only iterate when there's at least one row).
    if [ "${#SEED_UIDS[@]}" -gt 0 ]; then
      for i in "${!SEED_UIDS[@]}"; do
        USER_ID="${SEED_UIDS[$i]}"
        VAL="${SEED_SCORES[$i]}"
        # final_grade_confirmation has NOT NULL columns for thesis_id /
        # committee_id / confirmed_by. We can fill committee_id with the
        # live CID; thesis_id / confirmed_by stay as empty strings since
        # the head hasn't decided yet.
        curl -sS -X POST "$EVAL_API/api/final-grades" \
          -H 'Content-Type: application/json' \
          -d "$(jq -cn --arg sid "$USER_ID" --arg key "$SCORE_KEY" --argjson v "$VAL" --arg cid "$CID" \
                  '{studentId:$sid, thesisId:"", committeeId:$cid, confirmedBy:""} + {($key): $v}')" > /dev/null \
          && graded=$((graded+1)) || true
      done
    fi

    if [ -n "$SID" ]; then
      curl -sS -X PATCH "$WF_API/api/defense-sessions/$SID/close" \
           -H 'Content-Type: application/json' -d '{"actorId":"system"}' > /dev/null || true
    fi
    curl -sS -X PATCH "$COMM_API/api/committees/$CID/close" > /dev/null || true
    closed=$((closed+1))
  fi
done < <(jq -c '.[]' "$SRC")

echo
echo "Done [$STAGE]. committees=$made teachers_added=$t_added students_added=$s_added closed=$closed graded=$graded skipped=$skipped"
[ "$STATUS" = "ACTIVE" ] && echo "Stage stays ACTIVE — proceed with the live defense flow from the UI."
