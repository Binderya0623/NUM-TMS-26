#!/usr/bin/env bash
# =============================================================
# import-experts.sh — register every row in
#   infra/exam-prep/out/external-experts.json
# via user_service. The endpoint also registers auth-service
# credentials internally, so logging in with email + password
# works after this completes.
# =============================================================
set -euo pipefail

USER_API="${USER_API:-http://localhost:8086}"
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$HERE/out/external-experts.json"

[ -f "$SRC" ] || { echo "missing $SRC — run build-experts-json.py"; exit 1; }
command -v jq   >/dev/null || { echo "jq required";   exit 1; }
command -v curl >/dev/null || { echo "curl required"; exit 1; }

ok=0; failed=0
while IFS= read -r row; do
  EMAIL=$(jq -r '.email' <<<"$row")
  # Drop the internal `_short` traceability key before sending.
  BODY=$(jq -c 'del(._short)' <<<"$row")
  RES=$(curl -sS -X POST "$USER_API/api/users/external-experts" \
              -H 'Content-Type: application/json' -d "$BODY")
  if jq -e '.id' <<<"$RES" >/dev/null 2>&1; then
    echo "✓ $EMAIL"; ok=$((ok+1))
  else
    echo "  ERR $EMAIL: $RES"; failed=$((failed+1))
  fi
done < <(jq -c '.[]' "$SRC")

echo
echo "Done. ok=$ok failed=$failed"
