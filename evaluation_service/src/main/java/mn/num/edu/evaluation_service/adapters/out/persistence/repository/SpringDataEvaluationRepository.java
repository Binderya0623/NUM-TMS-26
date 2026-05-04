package mn.num.edu.evaluation_service.adapters.out.persistence.repository;

import  mn.num.edu.evaluation_service.adapters.out.persistence.entity.EvaluationEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import java.util.UUID;

public interface SpringDataEvaluationRepository extends ReactiveCrudRepository<EvaluationEntity, UUID> {
}