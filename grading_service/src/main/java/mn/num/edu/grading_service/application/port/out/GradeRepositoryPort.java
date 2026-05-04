package mn.num.edu.grading_service.application.port.out;

import mn.num.edu.grading_service.domain.model.Grade;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


public interface GradeRepositoryPort {
    Mono<Grade> save(Grade grade);
    Mono<Grade> findByThesisId( String thesisId);
    Flux<Grade> findByWorkflowId( String workflowId);
}