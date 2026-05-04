-- ================================================================
-- user_service — PostgreSQL schema (R2DBC)
-- Database : user_service
-- Changes  : + supervisor_quota, current_supervised_count on teachers
--            + has_approved_topic flag on students
--            + photo_url on users
-- ================================================================

CREATE TABLE IF NOT EXISTS users (
    id              VARCHAR(255) PRIMARY KEY,
    first_name      VARCHAR(255) NOT NULL,
    last_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    department_id   VARCHAR(255),
    system_role     VARCHAR(50)  NOT NULL,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    photo_url       VARCHAR(1000),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_system_role
        CHECK (system_role IN ('ADMIN','STUDENT','TEACHER','EXTERNAL_EXPERT','DEPARTMENT_HEAD'))
);

CREATE TABLE IF NOT EXISTS students (
    id                  VARCHAR(255) PRIMARY KEY,
    user_id             VARCHAR(255) NOT NULL UNIQUE
        REFERENCES users(id) ON DELETE CASCADE,
    student_id          VARCHAR(255) NOT NULL UNIQUE,  -- university SISI number
    major               VARCHAR(255),
    -- Set to TRUE when a topic_request is APPROVED in topic_service.
    -- Prevents the student from sending new selection requests.
    has_approved_topic  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS teachers (
    id                          VARCHAR(255) PRIMARY KEY,
    user_id                     VARCHAR(255) NOT NULL UNIQUE
        REFERENCES users(id) ON DELETE CASCADE,
    position                    VARCHAR(255),
    -- Maximum number of students this teacher is willing to supervise.
    supervisor_quota            INT NOT NULL DEFAULT 5,
    -- Denormalised counter incremented when a topic_request is APPROVED.
    -- Decremented when a thesis is FINALIZED or a student withdraws.
    current_supervised_count    INT NOT NULL DEFAULT 0,
    CONSTRAINT chk_quota_positive
        CHECK (supervisor_quota > 0),
    CONSTRAINT chk_count_non_negative
        CHECK (current_supervised_count >= 0)
);

CREATE TABLE IF NOT EXISTS external_experts (
    id              VARCHAR(255) PRIMARY KEY,
    user_id         VARCHAR(255) NOT NULL UNIQUE
        REFERENCES users(id) ON DELETE CASCADE,
    organization    VARCHAR(255),
    expertise       VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS departments (
    id              VARCHAR(255) PRIMARY KEY,
    user_id         VARCHAR(255) NOT NULL UNIQUE
        REFERENCES users(id) ON DELETE CASCADE,
    department_name VARCHAR(255) NOT NULL
);

-- ── Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role        ON users(system_role);
CREATE INDEX IF NOT EXISTS idx_users_dept        ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_students_user     ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_sisi     ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user     ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_departments_user  ON departments(user_id);
