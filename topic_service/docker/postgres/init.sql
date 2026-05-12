CREATE TABLE IF NOT EXISTS public.department (
    id       BIGSERIAL PRIMARY KEY,
    name     VARCHAR(255),
    programs JSON
);

CREATE TABLE IF NOT EXISTS public.student (
    id              BIGSERIAL PRIMARY KEY,
    dep_id          BIGINT,
    firstname       VARCHAR(255),
    is_choosed      BOOLEAN DEFAULT FALSE,
    lastname        VARCHAR(255),
    mail            VARCHAR(255),
    program         VARCHAR(255),
    proposed_number INTEGER DEFAULT 0,
    sisi_id         VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS public.teacher (
    id                  BIGSERIAL PRIMARY KEY,
    dep_id              BIGINT,
    firstname           VARCHAR(255),
    lastname            VARCHAR(255),
    mail                VARCHAR(255),
    num_of_choosed_stud INTEGER DEFAULT 0,
    sisi_id             VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS public.topic (
    id                     BIGSERIAL PRIMARY KEY,
    created_at             DATE,
    created_at_ts          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_id          VARCHAR(255),
    created_by_type        VARCHAR(255),
    fields                 JSON,
    form_id                BIGINT,
    is_deleted             BOOLEAN DEFAULT FALSE,
    keywords               TEXT,
    max_students           INTEGER DEFAULT 1,
    program                VARCHAR(255),
    proposed_to_teacher_id VARCHAR(255),
    rejection_reason       TEXT,
    status                 VARCHAR(255),
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visibility             VARCHAR(255) DEFAULT 'PRIVATE'
);

CREATE TABLE IF NOT EXISTS public.topic_selection_session (
    id            BIGSERIAL PRIMARY KEY,
    department_id VARCHAR(255),
    academic_year VARCHAR(50),
    semester      VARCHAR(50),
    duration_days INTEGER,
    start_date    DATE,
    end_date      DATE,
    status        VARCHAR(50),
    created_by    VARCHAR(255),
    closed_by     VARCHAR(255),
    closed_at     TIMESTAMP,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.topic_request (
    id                BIGSERIAL PRIMARY KEY,
    session_id        BIGINT,
    topic_id          BIGINT,
    requested_by_id   VARCHAR(255),
    requested_by_type VARCHAR(255),
    req_text          TEXT,
    req_note          TEXT,
    status            VARCHAR(255),
    is_selected       BOOLEAN,
    selected_at       DATE,
    rejection_reason  TEXT,
    responded_by_id   VARCHAR(255),
    responded_at      TIMESTAMP,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.plan (
    id               BIGSERIAL PRIMARY KEY,
    topic_request_id BIGINT,
    topic_id         BIGINT,
    student_id       VARCHAR(255),
    supervisor_id    VARCHAR(255),
    status           VARCHAR(255),
    revision_count   INTEGER DEFAULT 0,
    current_file_path VARCHAR(1000),
    submitted_at     TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at       DATE
);

CREATE TABLE IF NOT EXISTS public.plan_week (
    id          BIGSERIAL PRIMARY KEY,
    plan_id     BIGINT,
    result      JSON,
    task        TEXT,
    week_number INTEGER
);

CREATE TABLE IF NOT EXISTS public.plan_file (
    id                BIGSERIAL PRIMARY KEY,
    plan_id           BIGINT,
    submission_number INTEGER,
    original_filename VARCHAR(500),
    stored_path       VARCHAR(1000),
    file_size         BIGINT,
    mime_type         VARCHAR(100),
    uploaded_by       VARCHAR(255),
    uploaded_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.plan_review (
    id            BIGSERIAL PRIMARY KEY,
    plan_id       BIGINT,
    supervisor_id VARCHAR(255),
    decision      VARCHAR(50),
    feedback      TEXT,
    reviewed_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.plan_response (
    id            BIGSERIAL PRIMARY KEY,
    approver_id   BIGINT,
    approver_type VARCHAR(255),
    note          TEXT,
    plan_id       BIGINT,
    res           VARCHAR(255),
    res_date      DATE
);

CREATE INDEX IF NOT EXISTS idx_student_dep_id ON public.student(dep_id);
CREATE INDEX IF NOT EXISTS idx_teacher_dep_id ON public.teacher(dep_id);
CREATE INDEX IF NOT EXISTS idx_topic_status ON public.topic(status);
CREATE INDEX IF NOT EXISTS idx_topic_program ON public.topic(program);
CREATE INDEX IF NOT EXISTS idx_topic_created_at_ts ON public.topic(created_at_ts DESC);
CREATE INDEX IF NOT EXISTS idx_topic_request_topic_id ON public.topic_request(topic_id);
CREATE INDEX IF NOT EXISTS idx_plan_student_id ON public.plan(student_id);
CREATE INDEX IF NOT EXISTS idx_plan_topic_id ON public.plan(topic_id);
CREATE INDEX IF NOT EXISTS idx_plan_topic_request_id ON public.plan(topic_request_id);
CREATE INDEX IF NOT EXISTS idx_plan_week_plan_id ON public.plan_week(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_response_plan_id ON public.plan_response(plan_id);
