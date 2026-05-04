package mn.num.edu.message_service.adapter.in.web;

import mn.num.edu.message_service.domain.model.Message;
import mn.num.edu.message_service.domain.model.MessageStatus;

import java.time.Instant;

public record MessageResponse(
        String id,
        String conversationId,
        String senderId,
        String receiverId,
        String content,
        MessageStatus status,
        Instant createdAt,
        Instant seenAt
) {
    public static MessageResponse from(Message message) {
        return new MessageResponse(
                message.id(),
                message.conversationId(),
                message.senderId(),
                message.receiverId(),
                message.content(),
                message.status(),
                message.createdAt(),
                message.seenAt()
        );
    }
}