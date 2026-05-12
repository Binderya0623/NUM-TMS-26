\c thesisdb

CREATE TABLE IF NOT EXISTS department (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS student (
    id        BIGSERIAL PRIMARY KEY,
    firstname VARCHAR(255),
    lastname  VARCHAR(255),
    mail      VARCHAR(255),
    program   VARCHAR(255),
    dep_id    BIGINT REFERENCES department(id)
);

CREATE TABLE IF NOT EXISTS teacher (
    id        BIGSERIAL PRIMARY KEY,
    firstname VARCHAR(255),
    lastname  VARCHAR(255),
    mail      VARCHAR(255),
    dep_id    BIGINT REFERENCES department(id)
);

CREATE TABLE IF NOT EXISTS topic (
    id              BIGSERIAL PRIMARY KEY,
    created_at      DATE,
    created_by_id   VARCHAR(255),
    created_by_type VARCHAR(50),
    fields          JSON,
    form_id         BIGINT,
    program         VARCHAR(255),
    status          VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS topic_request (
    id                BIGSERIAL PRIMARY KEY,
    is_selected       BOOLEAN,
    req_note          TEXT,
    req_text          TEXT,
    requested_by_id   VARCHAR(255),
    requested_by_type VARCHAR(50),
    selected_at       DATE,
    topic_id          BIGINT REFERENCES topic(id)
);

CREATE TABLE IF NOT EXISTS topic_selection_session (
    id            BIGSERIAL PRIMARY KEY,
    department_id VARCHAR(255),
    academic_year VARCHAR(50),
    semester      VARCHAR(50),
    duration_days INT,
    start_date    DATE,
    end_date      DATE,
    status        VARCHAR(50),
    created_by    VARCHAR(255),
    closed_by     VARCHAR(255),
    closed_at     TIMESTAMP,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan (
    id         BIGSERIAL PRIMARY KEY,
    created_at DATE,
    status     VARCHAR(50),
    student_id VARCHAR(255),
    topic_id   BIGINT REFERENCES topic(id)
);

CREATE TABLE IF NOT EXISTS plan_week (
    id          BIGSERIAL PRIMARY KEY,
    plan_id     BIGINT REFERENCES plan(id),
    result      JSON,
    task        TEXT,
    week_number INT
);

CREATE TABLE IF NOT EXISTS plan_response (
    id            BIGSERIAL PRIMARY KEY,
    approver_id   BIGINT,
    approver_type VARCHAR(50),
    note          TEXT,
    plan_id       BIGINT REFERENCES plan(id),
    res           VARCHAR(50),
    res_date      DATE
);

CREATE TABLE IF NOT EXISTS plan_file (
    id                BIGSERIAL PRIMARY KEY,
    plan_id           BIGINT REFERENCES plan(id),
    submission_number INT,
    original_filename VARCHAR(500),
    stored_path       VARCHAR(1000),
    file_size         BIGINT,
    mime_type         VARCHAR(100),
    uploaded_by       VARCHAR(255),
    uploaded_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan_review (
    id            BIGSERIAL PRIMARY KEY,
    plan_id       BIGINT REFERENCES plan(id),
    supervisor_id VARCHAR(255),
    decision      VARCHAR(50),
    feedback      TEXT,
    reviewed_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
