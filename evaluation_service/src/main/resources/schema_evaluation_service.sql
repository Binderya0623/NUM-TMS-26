-- ================================================================
-- evaluation_service — PostgreSQL schema (R2DBC)
-- Database : evaluation_service
-- Covers   : Phase 5 — Blind grading, Secretary submissions,
--            Reviewer document uploads, Final grade confirmation
-- ID strategy : UUID (PostgreSQL native uuid type)
-- ================================================================

-- Enable uuid extension (required for gen_random_uuid() in older PG)
-- On PostgreSQL 13+ gen_random_uuid() is built-in; this is harmless.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Existing tables (kept) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evaluations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thesis_id       UUID NOT NULL,
    workflow_id     UUID NOT NULL,
    stage_id        UUID NOT NULL,
    stage_name      VARCHAR(255) NOT NULL,
    stage_max_point NUMERIC(10,2) NOT NULL,
    committee_id    UUID,
    evaluator_id    UUID,
    status          VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    CONSTRAINT chk_eval_status
        CHECK (status IN ('PENDING','IN_PROGRESS','SUBMITTED','COMPLETED'))
);

CREATE TABLE IF NOT EXISTS criterion_assessments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id    UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    criterion_id     UUID NOT NULL,
    criterion_name   VARCHAR(255) NOT NULL,
    max_point        NUMERIC(10,2) NOT NULL,
    achieved_percent INT          NOT NULL CHECK (achieved_percent BETWEEN 0 AND 100),
    weighted_score   NUMERIC(10,2) NOT NULL
);

-- ─────────────────────────────────────────────────────────────────
-- DEFENSE GRADE — BLIND per-evaluator score
-- ─────────────────────────────────────────────────────────────────
-- One row per (defense_session, thesis/student, evaluator).
-- API layer enforces blindness:
--   • GET my grade   → returns only the caller's own row
--   • GET all grades → returns nothing until secretary_submission exists
--
-- evaluator_role values and when they grade:
--   SUPERVISOR      → PROGRESS_1 only  (grades out of 15)
--   MEMBER          → PROGRESS_2, PRELIMINARY, FINAL (out of max_points)
--   HEAD            → same as MEMBER for committee score
--   SECRETARY       → same as MEMBER for committee score
--   EXTERNAL_EXPERT → same as MEMBER for committee score
--   REVIEWER        → FINAL only (grades out of 5, separately)
--
-- is_submitted = TRUE locks the row; no further edits allowed.
CREATE TABLE IF NOT EXISTS defense_grade (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Links to workflow_service.defense_session (no FK — microservice boundary)
    defense_session_id  VARCHAR(255) NOT NULL,
    thesis_id           VARCHAR(255) NOT NULL,
    student_id          VARCHAR(255) NOT NULL,
    evaluator_id        VARCHAR(255) NOT NULL,   -- user_service UUID
    evaluator_role      VARCHAR(30)  NOT NULL,
    points              NUMERIC(5,2) NOT NULL CHECK (points >= 0),
    max_points          NUMERIC(5,2) NOT NULL,
    comment             TEXT,
    is_submitted        BOOLEAN      NOT NULL DEFAULT FALSE,
    submitted_at        TIMESTAMP,
    CONSTRAINT uq_grade_per_evaluator
        UNIQUE (defense_session_id, thesis_id, evaluator_id),
    CONSTRAINT chk_dg_role CHECK (
        evaluator_role IN (
            'SUPERVISOR','MEMBER','HEAD','SECRETARY','EXTERNAL_EXPERT','REVIEWER'
        )
    ),
    CONSTRAINT chk_dg_points_in_range
        CHECK (points <= max_points)
);

-- ─────────────────────────────────────────────────────────────────
-- SECRETARY SUBMISSION — "Send Average Score to Admin"
-- ─────────────────────────────────────────────────────────────────
-- Created by the SECRETARY once all committee members have submitted
-- grades for a specific student. Action:
--   1. Computes average from defense_grade (committee roles only — excludes REVIEWER)
--   2. Records the average here
--   3. Lifts the blind restriction for this student in this session
--   4. Blocks any further grade submissions for this (student, session)
CREATE TABLE IF NOT EXISTS secretary_submission (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    defense_session_id  VARCHAR(255) NOT NULL,
    committee_id        VARCHAR(255) NOT NULL,
    student_id          VARCHAR(255) NOT NULL,
    secretary_id        VARCHAR(255) NOT NULL,   -- user_service UUID
    -- Average of all non-REVIEWER committee grades for this student
    average_score       NUMERIC(5,2) NOT NULL,
    total_evaluators    INT          NOT NULL,   -- how many grades were averaged
    submitted_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- One submission per (student, session) — prevents double-clicking
    CONSTRAINT uq_sec_submission UNIQUE (defense_session_id, student_id)
);

-- ─────────────────────────────────────────────────────────────────
-- REVIEW DOCUMENT — Reviewer uploads written review (шүүмж)
-- ─────────────────────────────────────────────────────────────────
-- Required in PRELIMINARY and FINAL defense stages.
-- Reviewer is assigned by the HEAD via reviewer_assignment in committee_service.
-- The upload becomes available for the student to download once uploaded.
-- stored_path : absolute path on server (e.g. /data/uploads/reviews/<uuid>)
CREATE TABLE IF NOT EXISTS review_document (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    defense_session_id  VARCHAR(255) NOT NULL,
    thesis_id           VARCHAR(255) NOT NULL,
    student_id          VARCHAR(255) NOT NULL,
    reviewer_id         VARCHAR(255) NOT NULL,   -- user_service UUID
    original_filename   VARCHAR(500) NOT NULL,
    stored_path         VARCHAR(1000) NOT NULL,
    file_size           BIGINT,
    mime_type           VARCHAR(100),
    uploaded_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- One review document per (reviewer, student, session)
    CONSTRAINT uq_review_doc UNIQUE (defense_session_id, student_id, reviewer_id)
);

-- ─────────────────────────────────────────────────────────────────
-- FINAL GRADE CONFIRMATION — Committee HEAD confirms final grade
-- ─────────────────────────────────────────────────────────────────
-- Created/updated by the HEAD after all 4 defense stages are complete.
-- HEAD sees all secretary-submitted averages + reviewer score, and
-- may manually adjust before confirming.
-- is_published = TRUE makes the grade visible to the student.
CREATE TABLE IF NOT EXISTS final_grade_confirmation (
    id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id            VARCHAR(255) NOT NULL UNIQUE,  -- one final record per student
    thesis_id             VARCHAR(255) NOT NULL,
    committee_id          VARCHAR(255) NOT NULL,
    confirmed_by          VARCHAR(255) NOT NULL,  -- HEAD user_service UUID

    -- Stage scores (filled from secretary_submission.average_score)
    progress_1_score      NUMERIC(5,2),  -- out of 15  (supervisor grade)
    progress_2_score      NUMERIC(5,2),  -- out of 20  (committee average)
    preliminary_score     NUMERIC(5,2),  -- out of 25  (committee average)
    final_committee_score NUMERIC(5,2),  -- out of 35  (committee average)
    reviewer_score        NUMERIC(5,2),  -- out of  5  (reviewer grade)
    total_score           NUMERIC(5,2),  -- sum; max = 100

    -- HEAD's final determination
    grade_letter          VARCHAR(5),    -- 'A','B+','B','C+','C','D','F'
    pass_fail             VARCHAR(10),   -- 'PASS' | 'FAIL'
    head_notes            TEXT,

    is_published          BOOLEAN      NOT NULL DEFAULT FALSE,
    confirmed_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at          TIMESTAMP,
    CONSTRAINT chk_fgc_total
        CHECK (total_score IS NULL OR (total_score >= 0 AND total_score <= 100)),
    CONSTRAINT chk_fgc_pass_fail
        CHECK (pass_fail IS NULL OR pass_fail IN ('PASS','FAIL'))
);

-- ─────────────────────────────────────────────────────────────────
-- GRADE NOTIFICATION — Phase 5 evaluation events
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grade_notification (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id        VARCHAR(255) NOT NULL,   -- user_service UUID
    type                VARCHAR(60)  NOT NULL,
    -- GRADE_SUBMITTED, ALL_GRADES_READY,
    -- SECRETARY_SUBMITTED_AVERAGE,
    -- REVIEWER_ASSIGNED, REVIEW_DOCUMENT_UPLOADED, REVIEW_DOCUMENT_REQUIRED,
    -- FINAL_GRADE_CONFIRMED, FINAL_GRADE_PUBLISHED
    thesis_id           VARCHAR(255),
    student_id          VARCHAR(255),
    defense_session_id  VARCHAR(255),
    title               VARCHAR(255) NOT NULL,
    message             TEXT         NOT NULL,
    is_read             BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_dg_session          ON defense_grade(defense_session_id);
CREATE INDEX IF NOT EXISTS idx_dg_student          ON defense_grade(student_id);
CREATE INDEX IF NOT EXISTS idx_dg_evaluator        ON defense_grade(evaluator_id);
-- Composite index for the most common query pattern
CREATE INDEX IF NOT EXISTS idx_dg_session_student  ON defense_grade(defense_session_id, student_id);
-- Partial index for unsubmitted grades (monitoring completeness)
CREATE INDEX IF NOT EXISTS idx_dg_pending
    ON defense_grade(defense_session_id, student_id)
    WHERE is_submitted = FALSE;

CREATE INDEX IF NOT EXISTS idx_ss_session          ON secretary_submission(defense_session_id);
CREATE INDEX IF NOT EXISTS idx_ss_student          ON secretary_submission(student_id);
CREATE INDEX IF NOT EXISTS idx_ss_committee        ON secretary_submission(committee_id);

CREATE INDEX IF NOT EXISTS idx_rd_session          ON review_document(defense_session_id);
CREATE INDEX IF NOT EXISTS idx_rd_student          ON review_document(student_id);
CREATE INDEX IF NOT EXISTS idx_rd_reviewer         ON review_document(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_fgc_student         ON final_grade_confirmation(student_id);
CREATE INDEX IF NOT EXISTS idx_fgc_committee       ON final_grade_confirmation(committee_id);
CREATE INDEX IF NOT EXISTS idx_fgc_published
    ON final_grade_confirmation(student_id)
    WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_gn_recipient        ON grade_notification(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_gn_created          ON grade_notification(created_at DESC);

-- ── Migration: allow same evaluator to submit a committee grade AND a reviewer
-- grade for the same student. The original uq_grade_per_evaluator prevented
-- the reviewer teacher (who is also a committee member) from submitting both
-- their committee role grade (out of 35) and their REVIEWER grade (out of 5).
ALTER TABLE defense_grade DROP CONSTRAINT IF EXISTS uq_grade_per_evaluator;
ALTER TABLE defense_grade DROP CONSTRAINT IF EXISTS uq_grade_per_evaluator_role;
ALTER TABLE defense_grade ADD CONSTRAINT uq_grade_per_evaluator_role
    UNIQUE (defense_session_id, thesis_id, evaluator_id, evaluator_role);
