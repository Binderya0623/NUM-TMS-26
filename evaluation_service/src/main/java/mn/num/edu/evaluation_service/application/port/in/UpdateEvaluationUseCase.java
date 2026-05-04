package mn.num.edu.evaluation_service.application.port.in;

import mn.num.edu.evaluation_service.application.dto.UpdateEvaluationCommand;
import reactor.core.publisher.Mono;

public interface UpdateEvaluationUseCase {
    Mono<Void> update(UpdateEvaluationCommand command);
}