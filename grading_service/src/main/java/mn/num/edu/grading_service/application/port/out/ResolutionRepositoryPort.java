package mn.num.edu.grading_service.application.port.out;

import mn.num.edu.grading_service.domain.model.Resolution;
import reactor.core.publisher.Mono;

public interface ResolutionRepositoryPort {
    Mono<Resolution> save(Resolution resolution);
    Mono<Resolution> findByWorkflowId(String workflowId);
}