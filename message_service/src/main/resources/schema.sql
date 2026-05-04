CREATE TABLE IF NOT EXISTS messages (
                                        id VARCHAR(100) PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL,
    sender_id VARCHAR(100) NOT NULL,
    receiver_id VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    seen_at TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages(conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_status
    ON messages(receiver_id, status);