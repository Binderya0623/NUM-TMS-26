package mn.num.edu.evaluation_service.adapters.out.persistence.repository;

import mn.num.edu.evaluation_service.adapters.out.persistence.entity.CriterionAssessmentEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface SpringDataCriterionAssessmentRepository extends ReactiveCrudRepository<CriterionAssessmentEntity, UUID> {
    Flux<CriterionAssessmentEntity> findByEvaluationId(UUID evaluationId);
    reactor.core.publisher.Mono<Void> deleteByEvaluationId(UUID evaluationId);
}