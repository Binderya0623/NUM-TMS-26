package mn.num.edu.evaluation_service.adapters.out.kafka;

import mn.num.edu.evaluation_service.domain.event.EvaluationCompletedEvent;
import mn.num.edu.evaluation_service.domain.event.EvaluationSubmittedEvent;
import mn.num.edu.evaluation_service.domain.event.EvaluationUpdatedEvent;
import mn.num.edu.evaluation_service.application.port.out.EvaluationEventPublisherPort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class EvaluationKafkaProducer implements EvaluationEventPublisherPort {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public EvaluationKafkaProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public Mono<Void> publishSubmitted(EvaluationSubmittedEvent event) {
        return Mono.fromFuture(kafkaTemplate.send("evaluation.submitted", event.evaluationId().toString(), event)).then();
    }

    @Override
    public Mono<Void> publishUpdated(EvaluationUpdatedEvent event) {
        return Mono.fromFuture(kafkaTemplate.send("evaluation.updated", event.evaluationId().toString(), event)).then();
    }

    @Override
    public Mono<Void> publishCompleted(EvaluationCompletedEvent event) {
        return Mono.fromFuture(kafkaTemplate.send("evaluation.completed", event.evaluationId().toString(), event)).then();
    }
}