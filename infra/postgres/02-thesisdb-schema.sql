\c thesisdb

CREATE TABLE IF NOT EXISTS department (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS student (
    id               BIGSERIAL PRIMARY KEY,
    sisi_id          VARCHAR(255),
    firstname        VARCHAR(255),
    lastname         VARCHAR(255),
    mail             VARCHAR(255),
    program          VARCHAR(255),
    dep_id           BIGINT REFERENCES department(id),
    proposed_number  INT     DEFAULT 0,
    is_choosed       BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS teacher (
    id                   BIGSERIAL PRIMARY KEY,
    sisi_id              VARCHAR(255),
    firstname            VARCHAR(255),
    lastname             VARCHAR(255),
    mail                 VARCHAR(255),
    dep_id               BIGINT REFERENCES department(id),
    num_of_choosed_stud  INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS topic (
    id                      BIGSERIAL PRIMARY KEY,
    created_by_id           VARCHAR(255),
    created_by_type         VARCHAR(50),
    proposed_to_teacher_id  VARCHAR(255),
    program                 VARCHAR(255),
    fields                  JSON,
    keywords                TEXT,
    visibility              VARCHAR(50)  DEFAULT 'PUBLIC',
    status                  VARCHAR(50),
    max_students            INT          DEFAULT 1,
    created_at              DATE,
    created_at_ts           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    is_deleted              BOOLEAN      DEFAULT FALSE,
    rejection_reason        TEXT,
    form_id                 BIGINT
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

CREATE TABLE IF NOT EXISTS topic_request (
    id                BIGSERIAL PRIMARY KEY,
    session_id        BIGINT REFERENCES topic_selection_session(id),
    topic_id          BIGINT REFERENCES topic(id),
    requested_by_id   VARCHAR(255),
    requested_by_type VARCHAR(50),
    req_text          TEXT,
    req_note          TEXT,
    status            VARCHAR(50),
    is_selected       BOOLEAN,
    selected_at       DATE,
    rejection_reason  TEXT,
    responded_by_id   VARCHAR(255),
    responded_at      TIMESTAMP,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan (
    id               BIGSERIAL PRIMARY KEY,
    topic_request_id BIGINT REFERENCES topic_request(id),
    topic_id         BIGINT REFERENCES topic(id),
    student_id       VARCHAR(255),
    supervisor_id    VARCHAR(255),
    status           VARCHAR(50),
    revision_count   INT  DEFAULT 0,
    created_at       DATE
);

CREATE TABLE IF NOT EXISTS plan_week (
    id          BIGSERIAL PRIMARY KEY,
    plan_id     BIGINT REFERENCES plan(id),
    week_number INT,
    task        TEXT,
    result      JSON
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

CREATE TABLE IF NOT EXISTS plan_response (
    id            BIGSERIAL PRIMARY KEY,
    plan_id       BIGINT REFERENCES plan(id),
    approver_id   BIGINT,
    approver_type VARCHAR(50),
    note          TEXT,
    res           VARCHAR(50),
    res_date      DATE
);
