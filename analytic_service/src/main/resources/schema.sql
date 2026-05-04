CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS analytics_counters (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_key  VARCHAR(100) NOT NULL UNIQUE,
    metric_value BIGINT      NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

