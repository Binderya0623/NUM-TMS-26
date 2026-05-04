-- ================================================================
-- thesis_service — PostgreSQL schema (R2DBC)
-- Database : thesis_service
-- Covers   : Thesis record lifecycle, Phase 4 (Execution — Chat +
--            Reports), cross-cutting file storage
-- ID strategy : VARCHAR(255) UUID (gen_random_uuid() at app layer)
-- ================================================================

-- ─────────────────────────────────────────────────────────────────
-- THESIS — master record created when topic_request is APPROVED
-- ─────────────────────────────────────────────────────────────────
-- Status lifecycle:
--   PLAN_PENDING       → topic approved; student must submit 15-week plan
--   PLAN_SUBMITTED     → plan submitted; awaiting supervisor approval
--   PLAN_REVISION      → supervisor requires plan revision
--   PLAN_APPROVED      → plan approved; awaiting admin to open execution session
--   EXECUTION_ACTIVE   → Phase 4 active (14-week execution session open)
--   DEFENSE_PENDING    → execution closed; awaiting admin to open defense stages
--   DEFENSE_ACTIVE     → at least one defense session open
--   FINALIZED          → committee head confirmed final grade
CREATE TABLE IF NOT EXISTS theses (
    id                  VARCHAR(255) PRIMARY KEY,
    student_id          VARCHAR(255) NOT NULL,   -- user_service UUID
    supervisor_id       VARCHAR(255) NOT NULL,   -- user_service UUID (teacher)
    committee_id        VARCHAR(255),            -- committee_service UUID (set when committee assigned)
    -- Cross-service references (no FK — microservice boundary)
    topic_request_id    BIGINT,                  -- topic_service.topic_request.id
    topic_id            BIGINT,                  -- topic_service.topic.id
    title_mn            VARCHAR(500) NOT NULL,
    title_en            VARCHAR(500),
    description         TEXT,
    department_id       VARCHAR(255),
    status              VARCHAR(50)  NOT NULL DEFAULT 'PLAN_PENDING',
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP,
    CONSTRAINT uq_thesis_student UNIQUE (student_id),  -- one active thesis per student
    CONSTRAINT chk_thesis_status CHECK (status IN (
        'PLAN_PENDING',
        'PLAN_SUBMITTED',
        'PLAN_REVISION',
        'PLAN_APPROVED',
        'EXECUTION_ACTIVE',
        'DEFENSE_PENDING',
        'DEFENSE_ACTIVE',
        'FINALIZED'
    ))
);

-- ─────────────────────────────────────────────────────────────────
-- THESIS REPORT — student submits a document per stage
-- ─────────────────────────────────────────────────────────────────
-- report_type determines which phase/stage this report belongs to:
--   EXECUTION_PROGRESS → Phase 4 regular progress report (no defense_session)
--   PROGRESS_1         → Phase 5 / Progress 1 defense
--   PROGRESS_2         → Phase 5 / Progress 2 defense
--   PRELIMINARY        → Phase 5 / Preliminary defense
--   FINAL              → Phase 5 / Final defense
--
-- For defense reports, defense_session_id links to workflow_service.
-- A student can only have ONE ACCEPTED report per (thesis, defense_session).
-- Previously REJECTED reports are kept for history (submission_number increments).
CREATE TABLE IF NOT EXISTS thesis_report (
    id                  VARCHAR(255) PRIMARY KEY,
    thesis_id           VARCHAR(255) NOT NULL REFERENCES theses(id) ON DELETE CASCADE,
    student_id          VARCHAR(255) NOT NULL,
    defense_session_id  VARCHAR(255),        -- NULL for EXECUTION_PROGRESS
    report_type         VARCHAR(30)  NOT NULL,
    submission_number   INT          NOT NULL DEFAULT 1,
    status              VARCHAR(30)  NOT NULL DEFAULT 'SUBMITTED',
    supervisor_notes    TEXT,                -- feedback / revision reason
    reviewed_by         VARCHAR(255),        -- user_service UUID
    reviewed_at         TIMESTAMP,
    submitted_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP,
    CONSTRAINT chk_report_type CHECK (report_type IN (
        'EXECUTION_PROGRESS','PROGRESS_1','PROGRESS_2','PRELIMINARY','FINAL'
    )),
    CONSTRAINT chk_report_status CHECK (status IN (
        'SUBMITTED',           -- awaiting supervisor/committee
        'REVISION_REQUIRED',   -- supervisor requests revision
        'ACCEPTED'             -- report accepted; grading can begin
    ))
);

-- ─────────────────────────────────────────────────────────────────
-- REPORT FILE — uploaded document(s) attached to a report
-- ─────────────────────────────────────────────────────────────────
-- stored_path : absolute path on the server (e.g. /data/uploads/reports/<uuid>)
-- Files are served via a dedicated download endpoint in thesis_service.
CREATE TABLE IF NOT EXISTS report_file (
    id                VARCHAR(255) PRIMARY KEY,
    report_id         VARCHAR(255) NOT NULL REFERENCES thesis_report(id) ON DELETE CASCADE,
    original_filename VARCHAR(500)  NOT NULL,
    stored_path       VARCHAR(1000) NOT NULL,
    file_size         BIGINT,
    mime_type         VARCHAR(100),
    uploaded_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────
-- CHAT MESSAGE — Phase 4 real-time / polled chat
-- ─────────────────────────────────────────────────────────────────
-- Enabled ONLY when thesis.status = 'EXECUTION_ACTIVE'.
-- Polled by clients every N seconds (GET /chat/{thesisId}/messages?since=<ts>).
-- Optional file attachment per message.
CREATE TABLE IF NOT EXISTS chat_message (
    id              VARCHAR(255) PRIMARY KEY,
    thesis_id       VARCHAR(255) NOT NULL REFERENCES theses(id) ON DELETE CASCADE,
    sender_id       VARCHAR(255) NOT NULL,   -- user_service UUID
    sender_role     VARCHAR(20)  NOT NULL,   -- 'STUDENT' | 'TEACHER'
    content         TEXT         NOT NULL,
    -- Optional single-file attachment
    attachment_path VARCHAR(1000),
    attachment_name VARCHAR(500),
    attachment_size BIGINT,
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    sent_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_sender_role CHECK (sender_role IN ('STUDENT','TEACHER'))
);

-- ─────────────────────────────────────────────────────────────────
-- THESIS NOTIFICATION — Phase 4 + 5 events
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS thesis_notification (
    id              VARCHAR(255) PRIMARY KEY,
    recipient_id    VARCHAR(255) NOT NULL,   -- user_service UUID
    thesis_id       VARCHAR(255),
    type            VARCHAR(60)  NOT NULL,
    -- REPORT_SUBMITTED, REPORT_ACCEPTED, REVISION_REQUIRED,
    -- EXECUTION_SESSION_OPENED, EXECUTION_SESSION_CLOSED,
    -- DEFENSE_SESSION_OPENED, DEFENSE_SESSION_CLOSED,
    -- NEW_CHAT_MESSAGE
    title           VARCHAR(255) NOT NULL,
    message         TEXT         NOT NULL,
    reference_id    VARCHAR(255),
    reference_type  VARCHAR(50),   -- 'REPORT' | 'DEFENSE_SESSION' | 'EXECUTION_SESSION'
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_theses_student       ON theses(student_id);
CREATE INDEX IF NOT EXISTS idx_theses_supervisor    ON theses(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_theses_committee     ON theses(committee_id);
CREATE INDEX IF NOT EXISTS idx_theses_status        ON theses(status);
CREATE INDEX IF NOT EXISTS idx_theses_dept          ON theses(department_id);

CREATE INDEX IF NOT EXISTS idx_report_thesis        ON thesis_report(thesis_id);
CREATE INDEX IF NOT EXISTS idx_report_student       ON thesis_report(student_id);
CREATE INDEX IF NOT EXISTS idx_report_type          ON thesis_report(report_type);
CREATE INDEX IF NOT EXISTS idx_report_session       ON thesis_report(defense_session_id);
CREATE INDEX IF NOT EXISTS idx_report_status        ON thesis_report(status);

CREATE INDEX IF NOT EXISTS idx_file_report          ON report_file(report_id);

CREATE INDEX IF NOT EXISTS idx_chat_thesis          ON chat_message(thesis_id);
CREATE INDEX IF NOT EXISTS idx_chat_sender          ON chat_message(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_sent_at         ON chat_message(thesis_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_unread
    ON chat_message(thesis_id, is_read)
    WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_tn_recipient         ON thesis_notification(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_tn_created           ON thesis_notification(created_at DESC);
