CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS grades (
    id              VARCHAR(36)  PRIMARY KEY,
    thesis_id       VARCHAR(255) NOT NULL,
    student_id      VARCHAR(255) NOT NULL,
    workflow_id     VARCHAR(255) NOT NULL,
    resolution_id   VARCHAR(36),
    total_score     NUMERIC(5,2),
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    calculated_at   TIMESTAMP,
    CONSTRAINT chk_grade_status CHECK (status IN ('PENDING','PASSED','FAILED'))
);

CREATE TABLE IF NOT EXISTS resolutions (
    id                VARCHAR(36)  PRIMARY KEY,
    workflow_id       VARCHAR(255) NOT NULL,
    resolution_number VARCHAR(100) NOT NULL,
    total_students    INT          NOT NULL DEFAULT 0,
    passed_count      INT          NOT NULL DEFAULT 0,
    failed_count      INT          NOT NULL DEFAULT 0,
    generated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

