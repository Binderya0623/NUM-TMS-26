package mn.num.edu.message_service.domain.model;

import java.time.Instant;
import java.util.UUID;

public record Message(
        String id,
        String conversationId,
        String senderId,
        String receiverId,
        String content,
        MessageStatus status,
        Instant createdAt,
        Instant seenAt
) {
    public static Message create(
            String conversationId,
            String senderId,
            String receiverId,
            String content
    ) {
        return new Message(
                UUID.randomUUID().toString(),
                conversationId,
                senderId,
                receiverId,
                content,
                MessageStatus.SENT,
                Instant.now(),
                null
        );
    }

    public Message markSeen() {
        return new Message(
                id,
                conversationId,
                senderId,
                receiverId,
                content,
                MessageStatus.SEEN,
                createdAt,
                Instant.now()
        );
    }
}