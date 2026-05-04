package mn.num.edu.thesis_service.adapter.out.persistence;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface ThesisR2dbcRepository extends ReactiveCrudRepository<ThesisEntity, String> {
    Mono<ThesisEntity> findByStudentId(String studentId);
}