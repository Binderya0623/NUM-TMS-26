package mn.num.edu.message_service.application.dto;

public record SendMessageCommand(
        String conversationId,
        String senderId,
        String receiverId,
        String content
) {
}