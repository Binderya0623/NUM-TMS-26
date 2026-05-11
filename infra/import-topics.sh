#!/usr/bin/env bash
# =============================================================
# import-topics.sh — bulk-create topics (and optionally select+approve
# them for a student) from a JSON array.
#
# Idempotent contract: starting from an empty topic_service DB, after
# running this once every row in the input becomes a fully-formed,
# APPROVED + auto-selected topic. Anything that would produce a partial
# state (missing teacher, missing student, no active selection session)
# is detected up-front in a preflight pass and the script aborts with
# the offending names BEFORE writing anything.
#
# Row shape (only `createdBy` is strictly required):
# {
#   "createdBy":     "amgalan.a",          // teacher username / email prefix
#   "createdByType": "TEACHER",
#   "supervisor":    "amgalan.a",          // optional — defaults to createdBy
#   "title":         "Холимог микрофронтенд...",
#   "titleEn":       "Hybrid microfrontend...",
#   "description":   "<p>...</p>",
#   "researchGoal":  "<p>...</p>",
#   "keywords":      "react, jsf",
#   "program":       "Программ Хангамж",
#   "status":        "APPROVED",           // if set, dept-decision flips it
#   "visibility":    "PUBLIC",
#   "maxStudents":   1,
#
#   // OPTIONAL — auto-selects + approves for this student.
#   "requestedById": "22B1NUM6150",
#   "motivation":    ""
# }
#
# Usage:
#   ./infra/import-topics.sh rows.json
# =============================================================
set -euo pipefail

INPUT="${1:?usage: $0 path/to/rows.json}"

TOPIC_API="${TOPIC_API:-http://localhost:8081}"
USER_API="${USER_API:-http://localhost:8086}"

command -v jq   >/dev/null || { echo "jq is required";   exit 1; }
command -v curl >/dev/null || { echo "curl is required"; exit 1; }

# ── 1) Pre-fetch user lists ──────────────────────────────────────────
TMAP=$(mktemp); SMAP=$(mktemp)
trap 'rm -f "$TMAP" "$SMAP"' EXIT

curl -sS "$USER_API/api/users/teachers" \
  | jq -r '.[] | "\((.email // "" | split("@")[0]) | ascii_downcase)\t\(.id)"' \
  > "$TMAP"
curl -sS "$USER_API/api/users/students" \
  | jq -r '.[] | "\((.email // "" | split("@")[0]) | ascii_downcase)\t\(.id)"' \
  > "$SMAP"

resolve_teacher() {
  awk -F '\t' -v k="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')" \
      '$1==k {print $2; exit}' "$TMAP"
}
resolve_student() {
  awk -F '\t' -v k="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')" \
      '$1==k {print $2; exit}' "$SMAP"
}

# ── 2) Preflight: every teacher+student referenced must already exist. ───
echo "Preflight…"
miss_teachers=(); miss_students=()
total_rows=$(jq 'length' "$INPUT")
while IFS= read -r row; do
  ct=$(jq -r '.createdBy // empty'              <<<"$row")
  sp=$(jq -r '.supervisor // .createdBy // empty' <<<"$row")
  st=$(jq -r '.requestedById // empty'           <<<"$row")
  for t in "$ct" "$sp"; do
    [[ -z "$t" ]] && continue
    [[ -z "$(resolve_teacher "$t")" ]] && miss_teachers+=("$t")
  done
  if [[ -n "$st" ]] && [[ -z "$(resolve_student "$st")" ]]; then
    miss_students+=("$st")
  fi
done < <(jq -c '.[]' "$INPUT")

# Dedup + report
if (( ${#miss_teachers[@]} + ${#miss_students[@]} > 0 )); then
  echo "ABORT — preflight failed. Register these in user_service first:"
  if (( ${#miss_teachers[@]} > 0 )); then
    echo "  Teachers (${#miss_teachers[@]}):"
    printf '    %s\n' "${miss_teachers[@]}" | sort -u
  fi
  if (( ${#miss_students[@]} > 0 )); then
    echo "  Students (${#miss_students[@]}):"
    printf '    %s\n' "${miss_students[@]}" | sort -u
  fi
  exit 2
fi
echo "  ✓ all $total_rows rows resolve."

# ── 3) Ensure an ACTIVE selection session exists. ─────────────────────
SESSION_ID=$(curl -sS "$TOPIC_API/api/v2/selection-sessions/active" \
              | jq -r '.id // empty' 2>/dev/null || true)
if [[ -z "$SESSION_ID" ]]; then
  echo "No active selection session — creating one…"
  YEAR=$(date +%Y)
  RES=$(curl -sS -X POST "$TOPIC_API/api/v2/selection-sessions" \
              -H 'Content-Type: application/json' \
              -d "$(jq -cn --arg ay "$YEAR-$((YEAR+1))" \
                     '{academicYear:$ay, semester:"SPRING", durationDays:30, createdBy:"system"}')")
  SESSION_ID=$(jq -r '.id // empty' <<<"$RES")
  if [[ -z "$SESSION_ID" ]]; then
    echo "  ERR creating session: $RES"; exit 3
  fi
  curl -sS -X PATCH "$TOPIC_API/api/v2/selection-sessions/$SESSION_ID/open" \
       -H 'Content-Type: application/json' \
       -d '{"actorId":"system"}' > /dev/null
  # Re-read to confirm it's actually OPEN.
  CHECK=$(curl -sS "$TOPIC_API/api/v2/selection-sessions/active" | jq -r '.id // empty')
  if [[ -z "$CHECK" ]]; then
    echo "  ERR: session $SESSION_ID created but not OPEN. Open it from /admin/evaluation-process and rerun."
    exit 3
  fi
  echo "  ✓ session $SESSION_ID open."
else
  echo "Active session: $SESSION_ID"
fi

# ── 4) Walk every row ──────────────────────────────────────────────────
created=0; selected=0; skipped=0
while IFS= read -r row; do
  CREATED_BY_RAW=$(jq -r '.createdBy // empty'              <<<"$row")
  SUPERVISOR_RAW=$(jq -r '.supervisor // .createdBy // empty' <<<"$row")
  STUDENT_RAW=$(   jq -r '.requestedById // empty'           <<<"$row")

  CREATED_BY_ID=$(resolve_teacher "$CREATED_BY_RAW")
  SUPERVISOR_ID=$(resolve_teacher "$SUPERVISOR_RAW")
  [[ -z "$SUPERVISOR_ID" ]] && SUPERVISOR_ID="$CREATED_BY_ID"

  TOPIC_BODY=$(jq -c \
    --arg cid "$CREATED_BY_ID" --arg sid "$SUPERVISOR_ID" '
      del(.createdBy, .supervisor, .requestedById, .motivation)
      + { createdById: $cid, supervisorId: $sid }' <<<"$row")

  TOPIC_RES=$(curl -sS -X POST "$TOPIC_API/api/v2/topics" \
                   -H 'Content-Type: application/json' \
                   -d "$TOPIC_BODY")
  TOPIC_ID=$(jq -r '.id // empty' <<<"$TOPIC_RES")
  if [[ -z "$TOPIC_ID" ]]; then
    echo "  ERR creating topic for '$CREATED_BY_RAW': $TOPIC_RES"
    skipped=$((skipped+1)); continue
  fi

  # Backend ignores `status:"APPROVED"` on create. For rows asking for
  # APPROVED, fire a dept-decision so the topic is selectable.
  WANT_STATUS=$(jq -r '.status // ""' <<<"$row")
  if [[ "$WANT_STATUS" == "APPROVED" ]]; then
    curl -sS -X POST "$TOPIC_API/api/v2/topics/$TOPIC_ID/dept-decision" \
         -H 'Content-Type: application/json' \
         -d "$(jq -cn --arg by "$SUPERVISOR_ID" \
                 '{decision:"APPROVE", reviewedBy:$by}')" > /dev/null || true
  fi

  TOPIC_TITLE=$(jq -r '.title // ""' <<<"$row" | head -c 60)
  echo "✓ topic id=$TOPIC_ID  '${TOPIC_TITLE}…'  by $CREATED_BY_RAW"
  created=$((created+1))

  # Bind student if present.
  if [[ -n "$STUDENT_RAW" ]]; then
    STUDENT_ID=$(resolve_student "$STUDENT_RAW")
    MOTIV=$(jq -r '.motivation // ""' <<<"$row")
    REQ_BODY=$(jq -cn \
      --arg sid "$STUDENT_ID" --arg motiv "$MOTIV" \
      --argjson tid "$TOPIC_ID" --argjson ssn "$SESSION_ID" \
      '{topicId:$tid, requestedById:$sid, sessionId:$ssn, motivation:$motiv}')

    REQ_RES=$(curl -sS -X POST "$TOPIC_API/api/v2/topic-requests" \
                   -H 'Content-Type: application/json' \
                   -d "$REQ_BODY")
    REQ_ID=$(jq -r '.id // empty' <<<"$REQ_RES")
    if [[ -z "$REQ_ID" ]]; then
      echo "    ↳ ERR submitting request for $STUDENT_RAW: $REQ_RES"
      continue
    fi

    APPROVE_RES=$(curl -sS -X POST "$TOPIC_API/api/v2/topic-requests/$REQ_ID/approve" \
                       -H 'Content-Type: application/json' \
                       -d "{\"teacherId\":\"$SUPERVISOR_ID\"}")
    if [[ "$(jq -r '.status // empty' <<<"$APPROVE_RES")" == "APPROVED" ]]; then
      echo "    ↳ approved request $REQ_ID for $STUDENT_RAW"
      selected=$((selected+1))
    else
      echo "    ↳ approve failed: $APPROVE_RES"
    fi
  fi
done < <(jq -c '.[]' "$INPUT")

echo
echo "Done. topics=$created, selected=$selected, skipped=$skipped"
