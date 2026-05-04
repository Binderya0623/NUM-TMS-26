package mn.num.edu.message_service.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mn.num.edu.message_service.adapter.in.web.SendMessageRequest;
import mn.num.edu.message_service.adapter.in.web.MessageResponse;
import mn.num.edu.message_service.application.dto.SendMessageCommand;
import mn.num.edu.message_service.application.port.in.GetMessagesUseCase;
import mn.num.edu.message_service.application.port.in.MarkMessageSeenUseCase;
import mn.num.edu.message_service.application.port.in.SendMessageUseCase;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {

    private final SendMessageUseCase sendMessageUseCase;
    private final GetMessagesUseCase getMessagesUseCase;
    private final MarkMessageSeenUseCase markMessageSeenUseCase;

    @PostMapping
    public Mono<MessageResponse> sendMessage(
            @Valid @RequestBody SendMessageRequest request
    ) {
        return sendMessageUseCase.send(
                new SendMessageCommand(
                        request.conversationId(),
                        request.senderId(),
                        request.receiverId(),
                        request.content()
                )
        ).map(MessageResponse::from);
    }

    @GetMapping("/{conversationId}")
    public Flux<MessageResponse> getMessages(
            @PathVariable String conversationId
    ) {
        return getMessagesUseCase.getMessages(conversationId)
                .map(MessageResponse::from);
    }

    @PostMapping("/{conversationId}/seen")
    public Mono<Void> markSeen(
            @PathVariable String conversationId,
            @RequestParam String userId
    ) {
        return markMessageSeenUseCase.markSeen(conversationId, userId);
    }
}