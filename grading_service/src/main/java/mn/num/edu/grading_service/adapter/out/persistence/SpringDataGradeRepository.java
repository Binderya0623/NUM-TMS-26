package mn.num.edu.grading_service.adapter.out.persistence;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface SpringDataGradeRepository extends ReactiveCrudRepository<GradeEntity,  String> {
    Mono<GradeEntity> findByThesisId( String thesisId);
    Flux<GradeEntity> findByWorkflowId( String workflowId);
    Flux<GradeEntity> findByResolutionId( String resolutionId);
}