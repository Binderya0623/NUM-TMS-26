CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS notifications (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL,
    title       VARCHAR(255),
    message     TEXT        NOT NULL,
    type        VARCHAR(60) NOT NULL,
    channel     VARCHAR(60),
    status      VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at     TIMESTAMP,
    CONSTRAINT chk_notif_status CHECK (status IN ('PENDING','SENT','FAILED','READ'))
);

