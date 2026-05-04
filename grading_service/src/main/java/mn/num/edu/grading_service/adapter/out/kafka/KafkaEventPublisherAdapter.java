package mn.num.edu.grading_service.adapter.out.kafka;

import mn.num.edu.grading_service.application.port.out.EventPublisherPort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class KafkaEventPublisherAdapter implements EventPublisherPort {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaEventPublisherAdapter(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public Mono<Void> publish(String topic, Object event) {
        return Mono.fromFuture(kafkaTemplate.send(topic, event)).then();
    }
}