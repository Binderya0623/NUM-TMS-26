CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────
-- NOTIFICATION — canonical store. Other services emit Kafka events
-- (or POST directly) and this is where the row lives.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL,
    title           VARCHAR(255),
    message         TEXT         NOT NULL,
    type            VARCHAR(60)  NOT NULL,
    channel         VARCHAR(60),
    status          VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    -- Per-thesis context (added 2026-05; older rows have NULL)
    thesis_id       VARCHAR(255),
    reference_id    VARCHAR(255),
    reference_type  VARCHAR(60),
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at         TIMESTAMP,
    CONSTRAINT chk_notif_status CHECK (status IN ('PENDING','SENT','FAILED','READ'))
);

-- ── Idempotent migrations for pre-existing databases ─────────────
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS thesis_id      VARCHAR(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS reference_id   VARCHAR(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS reference_type VARCHAR(60);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read        BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_notif_recipient ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_created   ON notifications(created_at DESC);
