#!/usr/bin/env bash
# =============================================================
# infra/seed.sh — Populate a freshly-started stack with a demo
# dataset so the app is usable immediately after `docker compose up`.
#
# What it creates:
#   • 1 department
#   • 1 admin user
#   • 5 teachers (HEAD/SECRETARY/MEMBER candidates) + 1 external expert
#   • 5 students
#
# Idempotent: existing rows are skipped.
#
# Usage:
#   ./infra/seed.sh                 # uses localhost defaults
#   AUTH_BASE=http://prod.example.com:8887 ./infra/seed.sh
# =============================================================
set -euo pipefail

AUTH_BASE="${AUTH_BASE:-http://localhost:8887}"
USER_BASE="${USER_BASE:-http://localhost:8086}"
DEFAULT_PASSWORD="${SEED_PASSWORD:-Num2026!}"

log()  { printf '\033[36m▶\033[0m %s\n' "$*"; }
ok()   { printf '\033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '\033[33m!\033[0m %s\n' "$*"; }
fail() { printf '\033[31m✗\033[0m %s\n' "$*" >&2; exit 1; }

# ── Wait for services ────────────────────────────────────────
wait_for() {
    local url=$1 name=$2 max=${3:-60} i=0
    log "waiting for $name ($url)…"
    until curl -sS -m 2 "$url" >/dev/null 2>&1; do
        i=$((i+1))
        if [ $i -ge "$max" ]; then fail "$name not reachable after ${max}s"; fi
        sleep 1
    done
    ok "$name reachable"
}
wait_for "$AUTH_BASE/actuator/health" "auth-service"
wait_for "$USER_BASE/actuator/health" "user-service"

# ── Helpers ──────────────────────────────────────────────────
register_user() {
    local sisi_id=$1 role=$2 first=$3 last=$4 email=$5
    # /auth/register: 200 on create, error if exists. Treat error as "already
    # there" — re-running the seed is supposed to be a no-op.
    local payload
    payload=$(cat <<JSON
{"sisiId":"$sisi_id","password":"$DEFAULT_PASSWORD","roles":["$role"],"firstName":"$first","lastName":"$last","email":"$email"}
JSON
)
    if curl -fsS -X POST "$AUTH_BASE/auth/register" \
            -H 'Content-Type: application/json' \
            -d "$payload" >/dev/null 2>&1; then
        ok "registered $sisi_id ($role)"
    else
        warn "skipped $sisi_id (likely already exists)"
    fi
}

post_user() {
    local path=$1 payload=$2 label=$3
    if curl -fsS -X POST "$USER_BASE/api/users/$path" \
            -H 'Content-Type: application/json' \
            -d "$payload" >/dev/null 2>&1; then
        ok "created $label"
    else
        warn "skipped $label (likely already exists)"
    fi
}

# ── Department ───────────────────────────────────────────────
log "Creating department…"
post_user "departments" \
'{"firstName":"NUM","lastName":"AppliedMath","email":"dept-am@num.edu.mn","departmentId":"AM","departmentName":"Хэрэглээний математикийн тэнхим"}' \
"department AM"

# ── Admin ────────────────────────────────────────────────────
log "Creating admin…"
register_user "admin"        "ROLE_ADMIN"           "Системийн" "Админ"   "admin@num.edu.mn"

# ── Teachers ─────────────────────────────────────────────────
log "Creating teachers…"
register_user "t.head"       "ROLE_TEACHER"         "Дарга"     "Багш"    "t.head@num.edu.mn"
register_user "t.secretary"  "ROLE_TEACHER"         "Нарийн"    "Багш"    "t.secretary@num.edu.mn"
register_user "t.member1"    "ROLE_TEACHER"         "Гишүүн1"   "Багш"    "t.member1@num.edu.mn"
register_user "t.member2"    "ROLE_TEACHER"         "Гишүүн2"   "Багш"    "t.member2@num.edu.mn"
register_user "t.member3"    "ROLE_TEACHER"         "Гишүүн3"   "Багш"    "t.member3@num.edu.mn"

post_user "teachers" '{"firstName":"Дарга","lastName":"Багш","email":"t.head@num.edu.mn","departmentId":"AM","position":"Дэд профессор"}'      "head teacher"
post_user "teachers" '{"firstName":"Нарийн","lastName":"Багш","email":"t.secretary@num.edu.mn","departmentId":"AM","position":"Багш"}'        "secretary teacher"
post_user "teachers" '{"firstName":"Гишүүн1","lastName":"Багш","email":"t.member1@num.edu.mn","departmentId":"AM","position":"Багш"}'        "member1"
post_user "teachers" '{"firstName":"Гишүүн2","lastName":"Багш","email":"t.member2@num.edu.mn","departmentId":"AM","position":"Багш"}'        "member2"
post_user "teachers" '{"firstName":"Гишүүн3","lastName":"Багш","email":"t.member3@num.edu.mn","departmentId":"AM","position":"Багш"}'        "member3"

# ── External expert ──────────────────────────────────────────
log "Creating external expert…"
register_user "expert.1"     "ROLE_TEACHER"         "Эксперт"   "Гадаад"  "expert@external.example.com"
post_user "external-experts" '{"firstName":"Эксперт","lastName":"Гадаад","email":"expert@external.example.com","organization":"Mongol Tech LLC","expertise":"Software engineering"}' \
"external expert"

# ── Students ─────────────────────────────────────────────────
log "Creating students…"
declare -a students=(
  "22b1num0027|Бат|Бямба"
  "22b1num1811|Сараа|Бат"
  "22b1num5541|Дорж|Тэмүүлэн"
  "22b1num5330|Эрдэнэ|Гэрэлт"
  "22b1num5773|Бямбасүрэн|Сүхбаатар"
)
for s in "${students[@]}"; do
    IFS='|' read -r sid first last <<<"$s"
    register_user "$sid" "ROLE_STUDENT" "$first" "$last" "$sid@stud.num.edu.mn"
    post_user "students" "{\"firstName\":\"$first\",\"lastName\":\"$last\",\"email\":\"$sid@stud.num.edu.mn\",\"studentId\":\"$sid\",\"departmentId\":\"AM\",\"major\":\"Хэрэглээний математик\"}" "student $sid"
done

echo
ok "Seed complete."
cat <<EOF

Login credentials (default password: ${DEFAULT_PASSWORD})
  admin       admin
  teacher     t.head, t.secretary, t.member1, t.member2, t.member3, expert.1
  student     22b1num0027, 22b1num1811, 22b1num5541, 22b1num5330, 22b1num5773

Open the host UI at: http://localhost:${NGINX_PORT:-9090}/
EOF
