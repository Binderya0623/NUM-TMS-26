package mn.num.edu.message_service.adapter.in.web;

import jakarta.validation.constraints.NotBlank;

public record SendMessageRequest(
        @NotBlank String conversationId,
        @NotBlank String senderId,
        @NotBlank String receiverId,
        @NotBlank String content
) {
}