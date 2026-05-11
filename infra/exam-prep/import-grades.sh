#!/usr/bin/env bash
# =============================================================
# import-grades.sh — seed per-student per-stage scores via
# evaluation_service's confirm-grade endpoint. The committee
# UUID + final/reviewer scores stay null; HEAD publishes later
# from the UI when the actual final defense is in.
#
# Reads:  infra/exam-prep/out/grades.json + ../../students.json
#         (to resolve sisiId → user-service UUID)
# =============================================================
# Loose mode: a single failing row must not kill the rest of the import.
set -o pipefail

EVAL_API="${EVAL_API:-http://localhost:8085}"
USER_API="${USER_API:-http://localhost:8086}"
HERE="$(cd "$(dirname "$0")" && pwd)"
GRADES="$HERE/out/grades.json"

command -v jq   >/dev/null || { echo "jq required";   exit 1; }
command -v curl >/dev/null || { echo "curl required"; exit 1; }
[ -f "$GRADES" ] || { echo "Run build-jsons.py first."; exit 1; }

# Build sisiId(lower) → UUID map from user-service.
TMP=$(mktemp); trap 'rm -f "$TMP"' EXIT
curl -sS "$USER_API/api/users/students" \
  | jq -r '.[] | "\((.email // "" | split("@")[0]) | ascii_downcase)\t\(.id)"' \
  > "$TMP"

resolve() {
  awk -F '\t' -v k="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')" \
      '$1==k {print $2; exit}' "$TMP"
}

ok=0; skipped=0; failed=0
while IFS= read -r row; do
  SID_RAW=$(jq -r '.studentId' <<<"$row")
  STUDENT_ID=$(resolve "$SID_RAW")
  if [ -z "$STUDENT_ID" ]; then
    echo "skip — student not found: $SID_RAW"; skipped=$((skipped+1)); continue
  fi
  # final_grade_confirmation has NOT NULL columns for thesis_id / committee_id /
  # confirmed_by. We don't know any of them at this stage (head will fill them
  # in later when committees are formed), so send empty strings — the schema
  # accepts those, only NULL is rejected.
  BODY=$(jq -c \
    --arg sid "$STUDENT_ID" '
      { studentId: $sid,
        thesisId: "",
        committeeId: "",
        confirmedBy: "",
        progress1Score:    .phase1,
        progress2Score:    .phase2,
        preliminaryScore:  .pre }' <<<"$row")
  RES=$(curl -sS -X POST "$EVAL_API/api/final-grades" \
              -H 'Content-Type: application/json' -d "$BODY")
  if jq -e '.id' <<<"$RES" >/dev/null 2>&1; then
    echo "✓ $SID_RAW"; ok=$((ok+1))
  else
    echo "  ERR $SID_RAW: $RES"; failed=$((failed+1))
  fi
done < <(jq -c '.[]' "$GRADES")

echo
echo "Done. ok=$ok skipped=$skipped failed=$failed"
