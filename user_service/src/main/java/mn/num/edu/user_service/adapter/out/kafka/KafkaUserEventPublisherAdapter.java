package mn.num.edu.user_service.adapter.out.kafka;

import mn.num.edu.user_service.application.port.out.UserEventPublisherPort;
import mn.num.edu.user_service.application.service.CreateStudentService;
import mn.num.edu.user_service.domain.event.UserCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component("kafkaUserEventPublisherAdapter")
public class KafkaUserEventPublisherAdapter implements UserEventPublisherPort {
    private static final Logger log = LoggerFactory.getLogger(CreateStudentService.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final String userCreatedTopic;

    public KafkaUserEventPublisherAdapter(
            KafkaTemplate<String, Object> kafkaTemplate,
            @Value("${app.kafka.topic.user-created}") String userCreatedTopic
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.userCreatedTopic = userCreatedTopic;
    }

    @Override
    public Mono<Void> publishUserCreated(UserCreatedEvent event) {
        return Mono.fromFuture(
                        kafkaTemplate.send(userCreatedTopic, event.getPayload().getUserId(), event)
                )
                .doOnSuccess(result ->
                        log.info("✅ Event sent to Kafka. topic={}, partition={}, offset={}",
                                result.getRecordMetadata().topic(),
                                result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset()
                        )
                )
                .doOnError(error ->
                        log.error("❌ Failed to send event to Kafka", error)
                )
                .then();
    }
    @Override
    public Mono<Void> publishStudentCreated(UserCreatedEvent event) {
        return Mono.fromFuture(
                        kafkaTemplate.send(userCreatedTopic, event.getPayload().getUserId(), event)
                )
                .doOnSuccess(result ->
                        log.info("✅ Student Event sent to Kafka. topic={}, partition={}, offset={}, depId={} ",
                                result.getRecordMetadata().topic(),
                                result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset(),
                                event.getPayload().getDepartmentId()
                        )
                )
                .doOnError(error ->
                        log.error("❌ Failed to send event to Kafka", error)
                )
                .then();
    }

    @Override
    public Mono<Void> publishTeacherCreated(UserCreatedEvent event) {
        return Mono.fromFuture(
                        kafkaTemplate.send(userCreatedTopic, event.getPayload().getUserId(), event)
                )
                .doOnSuccess(result ->
                        log.info("✅ Teacher Event sent to Kafka. topic={}, partition={}, offset={}, depId={} ",
                                result.getRecordMetadata().topic(),
                                result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset(),
                                event.getPayload().getDepartmentId()
                        )
                )
                .doOnError(error ->
                        log.error("❌ Failed to send event to Kafka", error)
                )
                .then();
    }

    @Override
    public Mono<Void> publishDepartmentCreated(UserCreatedEvent event) {
        return Mono.fromFuture(
                        kafkaTemplate.send(userCreatedTopic, event.getPayload().getUserId(), event)
                )
                .doOnSuccess(result ->
                        log.info("✅Department  Event sent to Kafka. topic={}, partition={}, offset={}, depId={} ",
                                result.getRecordMetadata().topic(),
                                result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset(),
                                event.getPayload().getDepartmentId()
                        )
                )
                .doOnError(error ->
                        log.error("❌ Failed to send event to Kafka", error)
                )
                .then();
    }
}
