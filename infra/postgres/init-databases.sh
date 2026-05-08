#!/usr/bin/env bash
# =============================================================
# init-databases.sh — runs inside postgres:14-alpine on first
# boot (mounted at /docker-entrypoint-initdb.d/). Creates one
# database per backend microservice.
# =============================================================
set -e

databases=(
  auth_service_db     # used by num_auth-main/auth-service
  user_service
  thesisdb            # used by topic_service
  committee_service
  thesis_service
  workflow_service
  evaluation_service
  notification_service
  report_service
  message_service
  analytic_service
  grading_service
)

for db in "${databases[@]}"; do
  echo "  → creating database $db"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    SELECT 'CREATE DATABASE $db'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$db')\gexec
EOSQL
done

echo "✓ all databases ready"
