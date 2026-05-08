package mn.num.edu.message_service.adapter.in.web;

import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Single-process fan-out for live chat events.
 *
 * One {@link Sinks.Many} per conversationId, multicast, replay the latest
 * event to a late subscriber so a refresh doesn't miss the message that just
 * landed. This is intentionally in-memory: it's correct for a single instance
 * and the prototype's deployment shape. To horizontally scale, swap the body
 * of publish/subscribe for a Kafka producer/consumer keyed on conversationId.
 */
@Component
public class MessageStreamBroker {

    private final Map<String, Sinks.Many<StreamEvent>> sinks = new ConcurrentHashMap<>();

    public void publish(String conversationId, StreamEvent event) {
        sinks.computeIfAbsent(conversationId, id ->
                Sinks.many().multicast().onBackpressureBuffer(64, false))
             .tryEmitNext(event);
    }

    public Flux<StreamEvent> subscribe(String conversationId) {
        return sinks.computeIfAbsent(conversationId, id ->
                Sinks.many().multicast().onBackpressureBuffer(64, false))
                .asFlux();
    }

    /** Marker for events emitted on the SSE stream. Tagged so the FE can branch. */
    public sealed interface StreamEvent permits MessageSentEvent, MessageSeenEvent {}

    public record MessageSentEvent(MessageResponse message) implements StreamEvent {}
    public record MessageSeenEvent(String conversationId, String viewerId, java.time.Instant at) implements StreamEvent {}
}
