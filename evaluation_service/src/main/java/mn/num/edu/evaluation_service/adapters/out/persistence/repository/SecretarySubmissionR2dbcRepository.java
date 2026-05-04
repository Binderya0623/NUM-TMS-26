package mn.num.edu.evaluation_service.adapters.out.persistence.repository;

import mn.num.edu.evaluation_service.adapters.out.persistence.entity.SecretarySubmissionEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface SecretarySubmissionR2dbcRepository extends ReactiveCrudRepository<SecretarySubmissionEntity, UUID> {

    Mono<SecretarySubmissionEntity> findByDefenseSessionIdAndStudentId(String defenseSessionId, String studentId);

    Flux<SecretarySubmissionEntity> findByDefenseSessionId(String defenseSessionId);

    Flux<SecretarySubmissionEntity> findByCommitteeId(String committeeId);

    Flux<SecretarySubmissionEntity> findByStudentId(String studentId);
}
