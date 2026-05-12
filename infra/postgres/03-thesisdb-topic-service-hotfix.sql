ALTER TABLE public.topic
    ALTER COLUMN created_by_id TYPE VARCHAR(255),
    ADD COLUMN IF NOT EXISTS proposed_to_teacher_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS keywords TEXT,
    ADD COLUMN IF NOT EXISTS visibility VARCHAR(255) DEFAULT 'PRIVATE',
    ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS created_at_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

UPDATE public.topic
SET created_at_ts = COALESCE(created_at_ts, CURRENT_TIMESTAMP)
WHERE created_at_ts IS NULL;

UPDATE public.topic
SET updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
WHERE updated_at IS NULL;

UPDATE public.topic
SET visibility = COALESCE(visibility, 'PRIVATE')
WHERE visibility IS NULL;

UPDATE public.topic
SET max_students = COALESCE(max_students, 1)
WHERE max_students IS NULL;

UPDATE public.topic
SET is_deleted = COALESCE(is_deleted, FALSE)
WHERE is_deleted IS NULL;

ALTER TABLE public.topic_request
    ALTER COLUMN requested_by_id TYPE VARCHAR(255),
    ADD COLUMN IF NOT EXISTS session_id BIGINT,
    ADD COLUMN IF NOT EXISTS status VARCHAR(255),
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS responded_by_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE public.plan
    ADD COLUMN IF NOT EXISTS topic_request_id BIGINT,
    ADD COLUMN IF NOT EXISTS supervisor_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS current_file_path VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

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

CREATE INDEX IF NOT EXISTS idx_topic_status ON public.topic(status);
CREATE INDEX IF NOT EXISTS idx_topic_program ON public.topic(program);
CREATE INDEX IF NOT EXISTS idx_topic_created_at_ts ON public.topic(created_at_ts DESC);
CREATE INDEX IF NOT EXISTS idx_topic_request_topic_id ON public.topic_request(topic_id);
CREATE INDEX IF NOT EXISTS idx_plan_topic_request_id ON public.plan(topic_request_id);
