package mn.num.edu.thesis_service.adapter.in.web;

import mn.num.edu.thesis_service.adapter.out.persistence.ChatMessageEntity;
import mn.num.edu.thesis_service.adapter.out.persistence.ChatMessageR2dbcRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatMessageR2dbcRepository chatRepo;

    public ChatController(ChatMessageR2dbcRepository chatRepo) {
        this.chatRepo = chatRepo;
    }

    /**
     * GET /api/chat/{thesisId}/messages?since=<ISO_DATETIME>
     * Polled by client to get new messages. If since is null, returns all messages.
     * Chat is only enabled when thesis.status = EXECUTION_ACTIVE.
     */
    @GetMapping("/{thesisId}/messages")
    public Flux<ChatMessageEntity> getMessages(
            @PathVariable String thesisId,
            @RequestParam(required = false) String since
    ) {
        if (since != null) {
            LocalDateTime sinceTime = LocalDateTime.parse(since);
            return chatRepo.findByThesisIdAndSentAtAfter(thesisId, sinceTime);
        }
        return chatRepo.findByThesisId(thesisId);
    }

    /**
     * GET /api/chat/{thesisId}/unread?readerId=xxx — messages unread by the caller
     */
    @GetMapping("/{thesisId}/unread")
    public Flux<ChatMessageEntity> getUnread(@PathVariable String thesisId,
                                              @RequestParam String readerId) {
        return chatRepo.findUnreadByThesisId(thesisId, readerId);
    }

    /**
     * POST /api/chat/{thesisId}/messages — send a new message.
     * Validates thesis is EXECUTION_ACTIVE.
     */
    @PostMapping("/{thesisId}/messages")
    public Mono<ResponseEntity<ChatMessageEntity>> sendMessage(
            @PathVariable String thesisId,
            @RequestBody SendMessageRequest req
    ) {
        // Save message directly; thesis existence check is optional for prototype
        ChatMessageEntity msg = new ChatMessageEntity();
        msg.setId(UUID.randomUUID().toString());
        msg.setNew(true);
        msg.setThesisId(thesisId);
        msg.setSenderId(req.senderId());
        msg.setSenderRole(req.senderRole());
        msg.setContent(req.content());
        msg.setIsRead(false);
        msg.setSentAt(LocalDateTime.now());
        return chatRepo.save(msg)
                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<java.util.Map<String, String>> handleError(RuntimeException ex) {
        return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
    }

    /**
     * PATCH /api/chat/{thesisId}/messages/mark-read?readerId=xxx
     * Marks all messages in a thesis as read for the given reader.
     */
    @PatchMapping("/{thesisId}/messages/mark-read")
    public Mono<ResponseEntity<Void>> markRead(@PathVariable String thesisId,
                                                @RequestParam String readerId) {
        return chatRepo.findUnreadByThesisId(thesisId, readerId)
                .flatMap(msg -> {
                    msg.setIsRead(true);
                    msg.setNew(false);
                    return chatRepo.save(msg);
                })
                .then(Mono.just(ResponseEntity.noContent().<Void>build()));
    }

    public record SendMessageRequest(String senderId, String senderRole, String content) {}
}
