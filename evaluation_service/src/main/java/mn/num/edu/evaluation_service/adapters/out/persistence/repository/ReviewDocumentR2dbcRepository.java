package mn.num.edu.evaluation_service.adapters.out.persistence.repository;

import mn.num.edu.evaluation_service.adapters.out.persistence.entity.ReviewDocumentEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface ReviewDocumentR2dbcRepository extends ReactiveCrudRepository<ReviewDocumentEntity, UUID> {

    Mono<ReviewDocumentEntity> findByDefenseSessionIdAndStudentIdAndReviewerId(
            String defenseSessionId, String studentId, String reviewerId);

    Flux<ReviewDocumentEntity> findByDefenseSessionId(String defenseSessionId);

    Flux<ReviewDocumentEntity> findByReviewerId(String reviewerId);

    Flux<ReviewDocumentEntity> findByStudentId(String studentId);
}
