-- ================================================================
-- workflow_service — PostgreSQL schema (R2DBC)
-- Database : workflow_service
-- Covers   : Phase 4 Execution Session, Phase 5 Defense Sessions
--            (Admin explicitly opens and closes each one)
-- ID strategy : VARCHAR(255) UUID
-- ================================================================

-- ── Existing tables (kept for backward compatibility) ────────────
CREATE TABLE IF NOT EXISTS workflows (
    id            VARCHAR(255) PRIMARY KEY,
    department_id VARCHAR(255) NOT NULL UNIQUE,
    title         VARCHAR(255) NOT NULL,
    status        VARCHAR(50)  NOT NULL DEFAULT 'DRAFT',
    CONSTRAINT chk_workflow_status
        CHECK (status IN ('DRAFT','ACTIVE','COMPLETED'))
);

CREATE TABLE IF NOT EXISTS workflow_stages (
    id             VARCHAR(255) PRIMARY KEY,
    workflow_id    VARCHAR(255) NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    name           VARCHAR(100) NOT NULL,
    start_date     DATE         NOT NULL,
    end_date       DATE         NOT NULL,
    weight_percent NUMERIC(5,2) NOT NULL,
    status         VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    stage          INT          NOT NULL,
    CONSTRAINT chk_stage_status
        CHECK (status IN ('PENDING','ACTIVE','CLOSED','COMPLETED'))
);

-- ─────────────────────────────────────────────────────────────────
-- Phase 4: THESIS EXECUTION SESSION
-- Admin opens one session per department/semester.
-- While ACTIVE, students may chat with supervisor and submit
-- EXECUTION_PROGRESS reports. Chat is disabled once CLOSED.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS thesis_execution_session (
    id              VARCHAR(255) PRIMARY KEY,
    department_id   VARCHAR(255) NOT NULL,
    academic_year   VARCHAR(20)  NOT NULL,   -- '2025-2026'
    semester        VARCHAR(10)  NOT NULL,   -- 'FALL' | 'SPRING'
    duration_weeks  INT          NOT NULL DEFAULT 14,
    status          VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    notes           TEXT,
    -- Admin who opened/closed this session (user_service UUID)
    started_by      VARCHAR(255),
    started_at      TIMESTAMP,
    closed_by       VARCHAR(255),
    closed_at       TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tes_status
        CHECK (status IN ('PENDING','ACTIVE','CLOSED')),
    -- Only one ACTIVE session per department at a time
    CONSTRAINT uq_tes_active_dept UNIQUE (department_id, academic_year, semester)
);

-- ─────────────────────────────────────────────────────────────────
-- Phase 5: DEFENSE SESSION
-- Admin explicitly opens and closes each stage for each committee.
-- Only one session per (committee, stage_type) can ever exist.
--
-- Stage types and their max point allocations:
--   PROGRESS_1  → 15 pts  — Supervisor grades only
--   PROGRESS_2  → 20 pts  — Blind committee grading; Secretary sends average
--   PRELIMINARY → 25 pts  — Blind committee grading; Head assigns Reviewer;
--                           Reviewer uploads review document
--   FINAL       → 35 pts  (committee, blind) + 5 pts (reviewer)
--                         — Secretary sends average; Head confirms final grade
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS defense_session (
    id              VARCHAR(255) PRIMARY KEY,
    department_id   VARCHAR(255) NOT NULL,
    -- Links to committee_service.committees (no FK — microservice boundary)
    committee_id    VARCHAR(255) NOT NULL,
    stage_type      VARCHAR(30)  NOT NULL,
    max_points      NUMERIC(5,2) NOT NULL,  -- 15 | 20 | 25 | 40
    status          VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    -- Admin who opened/closed this session
    started_by      VARCHAR(255),
    started_at      TIMESTAMP,
    closed_by       VARCHAR(255),
    closed_at       TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_ds_stage_type
        CHECK (stage_type IN ('PROGRESS_1','PROGRESS_2','PRELIMINARY','FINAL')),
    CONSTRAINT chk_ds_status
        CHECK (status IN ('PENDING','ACTIVE','CLOSED')),
    CONSTRAINT chk_ds_max_points
        CHECK (max_points IN (15, 20, 25, 40)),
    -- One session per (committee, stage) — prevents duplicate openings
    CONSTRAINT uq_ds_committee_stage UNIQUE (committee_id, stage_type)
);

