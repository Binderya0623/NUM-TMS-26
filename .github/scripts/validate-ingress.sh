#!/usr/bin/env bash
set -Eeuo pipefail

image=nginx:1.27-alpine
network="tms-ingress-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}"
mock="tms-ingress-mock-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}"
gateway="tms-ingress-gateway-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}"
scratch=$(mktemp -d)
route_count=0

cleanup() {
  docker rm -f "$gateway" "$mock" >/dev/null 2>&1 || true
  docker network rm "$network" >/dev/null 2>&1 || true
}
trap cleanup EXIT

setup_failure() {
  printf '::error title=Isolated test setup failure::%s\n' "$*" >&2
  exit 2
}

route_failure() {
  printf '::error title=HTTP routing failure::%s\n' "$*" >&2
  exit 1
}

cat > "$scratch/mock.conf" <<'MOCK'
events {}
http {
  default_type text/plain;
  server { listen 80; return 200 "ej-acme:$request_uri"; }
  server { listen 8080; return 200 "jsf_host:$request_uri"; }
  server { listen 8887; return 200 "auth_service:$request_uri"; }
  server { listen 8086; return 200 "user_service:$request_uri"; }
  server { listen 8081; return 200 "topic_service:$request_uri"; }
  server { listen 8082; return 200 "committee_service:$request_uri"; }
  server { listen 8083; return 200 "thesis_service:$request_uri"; }
  server { listen 8084; return 200 "workflow_service:$request_uri"; }
  server { listen 8085; return 200 "evaluation_service:$request_uri"; }
  server { listen 8087; return 200 "notification_service:$request_uri"; }
  server { listen 8088; return 200 "report_service:$request_uri"; }
  server { listen 8089; return 200 "message_service:$request_uri"; }
  server { listen 8090; return 200 "analytic_service:$request_uri"; }
  server { listen 8091; return 200 "grading_service:$request_uri"; }
  server { listen 8100; return 200 "hospital:$request_uri"; }
}
MOCK

docker network create "$network" >/dev/null || setup_failure "Cannot create isolated Docker network."
docker run --rm -d --name "$mock" --network "$network" \
  --network-alias ej-acme \
  --network-alias jsf_host \
  --network-alias auth_service \
  --network-alias user_service \
  --network-alias topic_service \
  --network-alias committee_service \
  --network-alias thesis_service \
  --network-alias workflow_service \
  --network-alias evaluation_service \
  --network-alias notification_service \
  --network-alias report_service \
  --network-alias message_service \
  --network-alias analytic_service \
  --network-alias grading_service \
  -p 8100:8100 \
  -v "$scratch/mock.conf:/etc/nginx/nginx.conf:ro" \
  "$image" >/dev/null || setup_failure "Cannot start mock upstream container."
docker exec "$mock" nginx -t || setup_failure "Mock upstream Nginx configuration is invalid."

docker run --rm -d --name "$gateway" --network "$network" \
  -p 127.0.0.1::80 \
  -v "$PWD/infra/nginx/nginx.conf:/etc/nginx/nginx.conf:ro" \
  "$image" >/dev/null || setup_failure "Cannot start candidate Nginx container."
docker exec "$gateway" nginx -t || setup_failure "Candidate Nginx container did not start."

mapped=$(docker port "$gateway" 80/tcp) || setup_failure "Cannot find candidate HTTP port."
port=${mapped##*:}
base_url="http://127.0.0.1:$port"

assert_upstream() {
  local path=$1 expected=$2 host=${3:-116.206.83.75}
  local response status body
  response=$(curl --silent --show-error --retry 5 --retry-connrefused --retry-delay 1 \
    -H "Host: $host" -w 'HTTP_STATUS:%{http_code}' "$base_url$path") \
    || setup_failure "Cannot reach candidate gateway at $path."
  status=${response##*HTTP_STATUS:}
  body=${response%HTTP_STATUS:*}
  if [[ "$status" != 200 || "$body" != "$expected" ]]; then
    route_failure "$path with Host $host: expected 200 '$expected', got $status '$body'."
  fi
  route_count=$((route_count + 1))
}

assert_redirect() {
  local path=$1 expected=$2
  local response status location
  response=$(curl --silent --show-error --retry 5 --retry-connrefused --retry-delay 1 \
    -H 'Host: 116.206.83.75' -o /dev/null \
    -w '%{http_code} %{redirect_url}' "$base_url$path") \
    || setup_failure "Cannot reach candidate gateway at $path."
  read -r status location <<< "$response"
  if [[ "$status" != 308 || "$location" != "$expected" ]]; then
    route_failure "$path: expected 308 to '$expected', got $status to '$location'."
  fi
  route_count=$((route_count + 1))
}

assert_upstream / jsf_host:/
assert_upstream '/auth/session?x=1' 'auth_service:/auth/session?x=1'
assert_upstream /api/users/42 user_service:/api/users/42
assert_upstream /api/v2/topics topic_service:/api/v2/topics
assert_upstream /api/committee-teachers committee_service:/api/committee-teachers
assert_upstream /api/reviewer-assignments committee_service:/api/reviewer-assignments
assert_upstream /api/committees committee_service:/api/committees
assert_upstream /api/thesis-reports thesis_service:/api/thesis-reports
assert_upstream /api/theses thesis_service:/api/theses
assert_upstream /api/chat thesis_service:/api/chat
assert_upstream /api/defense-sessions workflow_service:/api/defense-sessions
assert_upstream /api/execution-sessions workflow_service:/api/execution-sessions
assert_upstream /api/workflows workflow_service:/api/workflows
assert_upstream /api/defense-grades evaluation_service:/api/defense-grades
assert_upstream /api/final-grades evaluation_service:/api/final-grades
assert_upstream /api/evaluations evaluation_service:/api/evaluations
assert_upstream /api/review-documents evaluation_service:/api/review-documents
assert_upstream /api/secretary-submissions evaluation_service:/api/secretary-submissions
assert_upstream /api/notifications notification_service:/api/notifications
assert_upstream /api/academic-reports report_service:/api/academic-reports
assert_upstream /api/messages/stream/updates message_service:/api/messages/stream/updates
assert_upstream /api/messages/42 message_service:/api/messages/42
assert_upstream /api/analytics analytic_service:/api/analytics
assert_upstream /api/grades grading_service:/api/grades
assert_upstream /api/users/42/ user_service:/api/users/42

assert_redirect /ej https://116.206.83.75/ej/
assert_redirect /ej/ https://116.206.83.75/ej/
assert_redirect '/ej/book?page=2' 'https://116.206.83.75/ej/book?page=2'

assert_upstream /.well-known/acme-challenge/domain-token \
  ej-acme:/.well-known/acme-challenge/domain-token learn.electronjaalschool.org
assert_upstream /.well-known/acme-challenge/ip-token \
  ej-acme:/.well-known/acme-challenge/ip-token 116.206.83.75

bridge_gateway=$(docker network inspect bridge --format '{{(index .IPAM.Config 0).Gateway}}') \
  || setup_failure "Cannot inspect Docker bridge gateway."
if [[ "$bridge_gateway" == 172.17.0.1 ]]; then
  assert_upstream /hospital/ping hospital:/hospital/ping
else
  printf '::warning::Hospital route skipped: runner bridge gateway is %s, while TMS config targets 172.17.0.1.\n' "$bridge_gateway"
fi

summary="Passed $route_count HTTP routing assertions with mock upstream responses."
printf '%s\n' "$summary"
if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  printf '%s\n' "$summary" >> "$GITHUB_STEP_SUMMARY"
fi