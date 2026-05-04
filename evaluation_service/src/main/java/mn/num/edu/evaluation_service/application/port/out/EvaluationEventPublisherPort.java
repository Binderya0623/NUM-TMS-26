package mn.num.edu.evaluation_service.application.port.out;

import mn.num.edu.evaluation_service.domain.event.EvaluationCompletedEvent;
import mn.num.edu.evaluation_service.domain.event.EvaluationSubmittedEvent;
import mn.num.edu.evaluation_service.domain.event.EvaluationUpdatedEvent;
import reactor.core.publisher.Mono;

public interface EvaluationEventPublisherPort {
    Mono<Void> publishSubmitted(EvaluationSubmittedEvent event);
    Mono<Void> publishUpdated(EvaluationUpdatedEvent event);
    Mono<Void> publishCompleted(EvaluationCompletedEvent event);
}