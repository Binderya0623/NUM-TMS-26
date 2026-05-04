#!/usr/bin/env bash
# =============================================================
# stop-services.sh — kills the PIDs recorded by start-services.sh
# =============================================================
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$ROOT/.run-pids"

if [ ! -f "$PID_FILE" ]; then
  echo "No $PID_FILE found — nothing to stop."
  exit 0
fi

while IFS=$' \t' read -r pid name; do
  [ -z "$pid" ] && continue
  if kill -0 "$pid" 2>/dev/null; then
    # Spring Boot's mvnw forks a Java child; kill the whole process group.
    pgid=$(ps -o pgid= "$pid" | tr -d ' ')
    if [ -n "$pgid" ]; then
      kill -TERM -"$pgid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
    else
      kill -TERM "$pid" 2>/dev/null || true
    fi
    echo "✓ stopped $name ($pid)"
  else
    echo "· $name ($pid) already gone"
  fi
done < "$PID_FILE"

rm -f "$PID_FILE"
