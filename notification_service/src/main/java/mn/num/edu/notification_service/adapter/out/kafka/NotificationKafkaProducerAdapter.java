package mn.num.edu.notification_service.adapter.out.kafka;

import mn.num.edu.notification_service.application.port.out.PublishNotificationEventPort;
import mn.num.edu.notification_service.domain.event.NotificationFailedEvent;
import mn.num.edu.notification_service.domain.event.NotificationSentEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class NotificationKafkaProducerAdapter implements PublishNotificationEventPort {

    private static final Logger log = LoggerFactory.getLogger(NotificationKafkaProducerAdapter.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public NotificationKafkaProducerAdapter(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public Mono<Void> publishSent(NotificationSentEvent event) {
        return Mono.fromFuture(kafkaTemplate.send("notification-sent", event))
                .doOnSuccess(result -> log.info("Published NotificationSentEvent: {}", event.notificationId()))
                .then();
    }

    @Override
    public Mono<Void> publishFailed(NotificationFailedEvent event) {
        return Mono.fromFuture(kafkaTemplate.send("notification-failed", event))
                .doOnSuccess(result -> log.info("Published NotificationFailedEvent: {}", event.notificationId()))
                .then();
    }
}
