package mn.num.edu.message_service.adapter.out.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mn.num.edu.message_service.application.port.out.MessageEventPublisherPort;
import mn.num.edu.message_service.domain.event.MessageSeenEvent;
import mn.num.edu.message_service.domain.event.MessageSentEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaMessageEventProducer implements MessageEventPublisherPort {

    private static final String MESSAGE_SENT_TOPIC = "message-sent";
    private static final String MESSAGE_SEEN_TOPIC = "message-seen";

    private final KafkaTemplate<String, Object> kafkaTemplate;
    @Override
    public Mono<Void> publishMessageSent(MessageSentEvent event) {
        return Mono.fromFuture(
                        kafkaTemplate.send(
                                MESSAGE_SENT_TOPIC,
                                event.messageId(),
                                event
                        )
                )
                .doOnSuccess(result ->
                        log.info("MessageSentEvent published. messageId={}", event.messageId())
                )
                .doOnError(error ->
                        log.error("Failed to publish MessageSentEvent. messageId={}",
                                event.messageId(), error)
                )
                .then();
    }

    @Override
    public Mono<Void> publishMessageSeen(MessageSeenEvent event) {
        return Mono.fromFuture(
                        kafkaTemplate.send(
                                MESSAGE_SEEN_TOPIC,
                                event.conversationId(),
                                event
                        )
                )
                .doOnSuccess(result ->
                        log.info("MessageSeenEvent published. conversationId={}",
                                event.conversationId())
                )
                .doOnError(error ->
                        log.error("Failed to publish MessageSeenEvent. conversationId={}",
                                event.conversationId(), error)
                )
                .then();
    }
}