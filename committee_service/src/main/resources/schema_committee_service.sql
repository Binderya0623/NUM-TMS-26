-- ================================================================
-- committee_service — PostgreSQL schema (R2DBC)
-- Database : committee_service
-- Covers   : Committee management, Phase 5 roles (Head, Secretary,
--            Reviewer), reviewer assignments
-- ID strategy : VARCHAR(150) / VARCHAR(255) (consistent with existing)
-- ================================================================

-- ─────────────────────────────────────────────────────────────────
-- COMMITTEE
-- One committee handles ALL defense stages for its assigned students.
-- Admin creates committees and assigns members before opening sessions.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS committees (
    id            VARCHAR(150) PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    department_id VARCHAR(150),
    -- defense_type kept for legacy; use defense_session.stage_type at runtime
    defense_type  VARCHAR(50)  DEFAULT 'ALL_STAGES',
    status        VARCHAR(30)  NOT NULL DEFAULT 'ACTIVE',
    closing_note  TEXT,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_committee_status
        CHECK (status IN ('ACTIVE','CLOSED'))
);

-- Idempotent migration for existing databases that pre-date closing_note.
ALTER TABLE committees ADD COLUMN IF NOT EXISTS closing_note TEXT;

-- ─────────────────────────────────────────────────────────────────
-- COMMITTEE TEACHERS — member roster with roles
-- ─────────────────────────────────────────────────────────────────
-- Roles:
--   HEAD            → Previously "SENIOR". Assigns reviewers (Preliminary + Final).
--                     Confirms/adjusts final grade (Final).
--                     Grades as a MEMBER for blind committee scoring.
--   SECRETARY       → Triggers "Send Average Score to Admin" for each student.
--                     Grades as a MEMBER for blind committee scoring.
--   MEMBER          → Regular committee teacher. Grades blindly.
--   EXTERNAL_EXPERT → Outside expert. Grades blindly (no role-specific duties).
--
-- Business constraints:
--   • Exactly ONE HEAD per committee  (enforced by partial unique index)
--   • Exactly ONE SECRETARY per committee (enforced by partial unique index)
--   • Minimum 3 members total (enforced at service layer)
--   • An external expert may be added even after session opens
CREATE TABLE IF NOT EXISTS committee_teachers (
    id             VARCHAR(150) PRIMARY KEY,
    committee_id   VARCHAR(150) NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    teacher_id     VARCHAR(150) NOT NULL,   -- user_service UUID
    committee_role VARCHAR(30)  NOT NULL DEFAULT 'MEMBER',
    added_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_committee_teacher UNIQUE (committee_id, teacher_id),
    CONSTRAINT chk_ct_role CHECK (
        committee_role IN ('HEAD','SECRETARY','MEMBER','EXTERNAL_EXPERT')
    )
);

-- One HEAD per committee
CREATE UNIQUE INDEX IF NOT EXISTS uq_committee_one_head
    ON committee_teachers(committee_id)
    WHERE committee_role = 'HEAD';

-- One SECRETARY per committee
CREATE UNIQUE INDEX IF NOT EXISTS uq_committee_one_secretary
    ON committee_teachers(committee_id)
    WHERE committee_role = 'SECRETARY';

-- ─────────────────────────────────────────────────────────────────
-- COMMITTEE STUDENTS — which students belong to this committee
-- ─────────────────────────────────────────────────────────────────
-- A student flows across stages and therefore belongs to multiple
-- committees over time: PROGRESS_2 → PRE_DEFENSE → FINAL_DEFENSE.
-- Only (committee_id, student_id) must be unique (no duplicate rows
-- per committee), NOT student_id alone.
CREATE TABLE IF NOT EXISTS committee_students (
    id           VARCHAR(150) PRIMARY KEY,
    committee_id VARCHAR(150) NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    student_id   VARCHAR(150) NOT NULL,   -- user_service UUID
    assigned_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_committee_student UNIQUE (committee_id, student_id)
);

-- Drop legacy constraint on existing databases (CREATE TABLE IF NOT EXISTS
-- is a no-op once the table exists, so the old uq_student_one_committee
-- would otherwise persist and block stage-to-stage copies).
ALTER TABLE committee_students DROP CONSTRAINT IF EXISTS uq_student_one_committee;

-- ─────────────────────────────────────────────────────────────────
-- REVIEWER ASSIGNMENT — Phase 5 / Preliminary + Final
-- ─────────────────────────────────────────────────────────────────
-- The Committee HEAD assigns one Reviewer (шүүмжлэгч) per student per
-- defense session. The reviewer MUST already be a committee member.
--
-- Reviewer duties:
--   PRELIMINARY → Read student's report; upload review document after Secretary submits.
--   FINAL       → Same as PRELIMINARY, plus grade the student out of 5 pts.
CREATE TABLE IF NOT EXISTS reviewer_assignment (
    id                 VARCHAR(150) PRIMARY KEY,
    committee_id       VARCHAR(150) NOT NULL,
    -- Links to workflow_service.defense_session (no FK — microservice boundary)
    defense_session_id VARCHAR(255) NOT NULL,
    student_id         VARCHAR(150) NOT NULL,  -- the student being reviewed
    reviewer_id        VARCHAR(150) NOT NULL,  -- teacher_id (must be in committee)
    assigned_by        VARCHAR(150) NOT NULL,  -- HEAD teacher_id
    assigned_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- One reviewer per student per defense session
    CONSTRAINT uq_reviewer_per_student_session
        UNIQUE (defense_session_id, student_id)
);

-- ─────────────────────────────────────────────────────────────────
-- SNAPSHOTS — denormalised cross-service caches
-- Updated via Kafka events from user_service
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teacher_snapshots (
    teacher_id    VARCHAR(100) PRIMARY KEY,
    department_id VARCHAR(100) NOT NULL,
    full_name     VARCHAR(255),
    email         VARCHAR(255),
    active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS student_snapshots (
    student_id    VARCHAR(100) PRIMARY KEY,
    department_id VARCHAR(100) NOT NULL,
    full_name     VARCHAR(255),
    email         VARCHAR(255),
    student_code  VARCHAR(50),
    active        BOOLEAN NOT NULL DEFAULT TRUE
);

-- ── Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ct_committee     ON committee_teachers(committee_id);
CREATE INDEX IF NOT EXISTS idx_ct_teacher       ON committee_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_ct_role          ON committee_teachers(committee_role);
CREATE INDEX IF NOT EXISTS idx_cs_committee     ON committee_students(committee_id);
CREATE INDEX IF NOT EXISTS idx_cs_student       ON committee_students(student_id);
CREATE INDEX IF NOT EXISTS idx_ra_session       ON reviewer_assignment(defense_session_id);
CREATE INDEX IF NOT EXISTS idx_ra_student       ON reviewer_assignment(student_id);
CREATE INDEX IF NOT EXISTS idx_ra_reviewer      ON reviewer_assignment(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_ra_committee     ON reviewer_assignment(committee_id);
