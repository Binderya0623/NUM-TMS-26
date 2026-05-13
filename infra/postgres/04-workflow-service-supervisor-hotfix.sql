ALTER TABLE defense_session
    ADD COLUMN IF NOT EXISTS supervisor_id VARCHAR(255);
