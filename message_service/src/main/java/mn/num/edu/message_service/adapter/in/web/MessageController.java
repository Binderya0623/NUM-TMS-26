package mn.num.edu.message_service.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mn.num.edu.message_service.application.dto.SendMessageCommand;
import mn.num.edu.message_service.adapter.out.persistence.MessageR2dbcRepository;
import mn.num.edu.message_service.application.port.in.GetMessagesUseCase;
import mn.num.edu.message_service.application.port.in.MarkMessageSeenUseCase;
import mn.num.edu.message_service.application.port.in.SendMessageUseCase;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {

    private final SendMessageUseCase sendMessageUseCase;
    private final GetMessagesUseCase getMessagesUseCase;
    private final MarkMessageSeenUseCase markMessageSeenUseCase;
    private final MessageR2dbcRepository messageRepo;
    private final MessageStreamBroker broker;

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
        ).map(MessageResponse::from)
         .doOnNext(resp -> broker.publish(resp.conversationId(),
                 new MessageStreamBroker.MessageSentEvent(resp)));
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
        return markMessageSeenUseCase.markSeen(conversationId, userId)
                .doOnSuccess(v -> broker.publish(conversationId,
                        new MessageStreamBroker.MessageSeenEvent(conversationId, userId, Instant.now())));
    }

    /**
     * GET /api/messages/unread-count?userId=X
     * Total unread messages addressed to this user across every conversation.
     * Drives the floating chat-button badge.
     */
    @GetMapping("/unread-count")
    public Mono<Map<String, Long>> unreadCount(@RequestParam String userId) {
        return messageRepo.countUnreadByReceiverId(userId)
                .defaultIfEmpty(0L)
                .map(c -> Map.of("count", c));
    }

    /**
     * GET /api/messages/stream/{conversationId}
     * SSE stream of live chat events for one conversation. Each event has a
     * named type ({@code message} or {@code seen}) so the frontend can branch
     * without unwrapping a discriminated union.
     *
     * A heartbeat ping every 25s keeps idle proxies (Tomcat, Nginx) from
     * closing the connection. EventSource auto-reconnects on disconnect.
     */
    @GetMapping(value = "/stream/{conversationId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<Object>> stream(@PathVariable String conversationId) {
        Flux<ServerSentEvent<Object>> events = broker.subscribe(conversationId)
                .map(evt -> {
                    if (evt instanceof MessageStreamBroker.MessageSentEvent m) {
                        return ServerSentEvent.<Object>builder()
                                .event("message")
                                .data(m.message())
                                .build();
                    }
                    if (evt instanceof MessageStreamBroker.MessageSeenEvent s) {
                        return ServerSentEvent.<Object>builder()
                                .event("seen")
                                .data(Map.of(
                                        "conversationId", s.conversationId(),
                                        "viewerId", s.viewerId(),
                                        "at", s.at().toString()
                                ))
                                .build();
                    }
                    return ServerSentEvent.<Object>builder().comment("noop").build();
                });
        Flux<ServerSentEvent<Object>> heartbeat = Flux.interval(Duration.ofSeconds(25))
                .map(i -> ServerSentEvent.<Object>builder().comment("hb").build());
        return Flux.merge(events, heartbeat);
    }
}
