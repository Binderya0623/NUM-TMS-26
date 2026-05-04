CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS academic_reports (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id   VARCHAR(255),
    academic_year   VARCHAR(20)  NOT NULL,
    total_students  INT          NOT NULL DEFAULT 0,
    passed_students INT          NOT NULL DEFAULT 0,
    failed_students INT          NOT NULL DEFAULT 0,
    average_score   NUMERIC(5,2),
    generated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generated_by    VARCHAR(255)
);

