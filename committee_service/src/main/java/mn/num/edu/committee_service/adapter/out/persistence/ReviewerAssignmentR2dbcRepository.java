package mn.num.edu.committee_service.adapter.out.persistence;

import mn.num.edu.committee_service.domain.model.ReviewerAssignment;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface ReviewerAssignmentR2dbcRepository extends ReactiveCrudRepository<ReviewerAssignment, String> {

    Flux<ReviewerAssignment> findByCommitteeId(String committeeId);

    Flux<ReviewerAssignment> findByDefenseSessionId(String defenseSessionId);

    Mono<ReviewerAssignment> findByDefenseSessionIdAndStudentId(String defenseSessionId, String studentId);

    Flux<ReviewerAssignment> findByReviewerId(String reviewerId);
}
