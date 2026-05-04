package mn.num.edu.evaluation_service.adapters.out.persistence.repository;

import mn.num.edu.evaluation_service.adapters.out.persistence.entity.FinalGradeConfirmationEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface FinalGradeConfirmationR2dbcRepository extends ReactiveCrudRepository<FinalGradeConfirmationEntity, UUID> {

    Mono<FinalGradeConfirmationEntity> findByStudentId(String studentId);

    Flux<FinalGradeConfirmationEntity> findByCommitteeId(String committeeId);

    Flux<FinalGradeConfirmationEntity> findByIsPublished(Boolean isPublished);
}
