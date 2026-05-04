#!/usr/bin/env bash
# =============================================================
# start-services.sh
#
# Boots every Spring Boot backend in this repo locally:
#   - 11 microservices in this directory
#   - num_auth-main/auth-service     (port 8887, JPA → auth_service_db)
#
# Each service runs via its own ./mvnw in the background.
# stdout+stderr go to logs/<service>.log; PIDs to .run-pids.
# =============================================================
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/logs"
PID_FILE="$ROOT/.run-pids"
mkdir -p "$LOG_DIR"
: > "$PID_FILE"

# service_dir | port | extra env (space separated KEY=VAL pairs, blank if none)
SERVICES=(
  "user_service|8086|"
  "topic_service|8081|"
  "committee_service|8082|"
  "thesis_service|8083|"
  "workflow_service|8084|"
  "evaluation_service|8085|"
  "notification_service|8087|"
  "report_service|8088|"
  "message_service|8089|"
  "analytic_service|8090|"
  # grading_service defaults to :8089 in application.properties, but
  # message_service holds :8089 — override via SERVER_PORT to match the
  # frontend's apiClient (which points grading at :8091).
  "grading_service|8091|SERVER_PORT=8091"
  "num_auth-main/auth-service|8887|"
)

start_one() {
  local entry="$1"
  IFS='|' read -r dir port env_kv <<< "$entry"
  local name; name="$(basename "$dir")"
  local log="$LOG_DIR/$name.log"

  echo "▶ $name on :$port"
  (
    cd "$ROOT/$dir"
    chmod +x mvnw 2>/dev/null || true
    # shellcheck disable=SC2086
    env $env_kv ./mvnw -q spring-boot:run > "$log" 2>&1
  ) &
  echo "$!  $name" >> "$PID_FILE"
}

for entry in "${SERVICES[@]}"; do
  start_one "$entry"
done

echo
echo "All 12 services launching in background. Logs: $LOG_DIR/*.log"
echo "Stop with: ./stop-services.sh"
echo "Tail one:  tail -f logs/user_service.log"
