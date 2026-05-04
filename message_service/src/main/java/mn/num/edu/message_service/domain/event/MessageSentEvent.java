package mn.num.edu.message_service.domain.event;

import java.time.Instant;

public record MessageSentEvent(
        String messageId,
        String conversationId,
        String senderId,
        String receiverId,
        String content,
        Instant createdAt
) {}