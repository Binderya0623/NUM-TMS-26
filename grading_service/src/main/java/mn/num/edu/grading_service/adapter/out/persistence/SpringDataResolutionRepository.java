package mn.num.edu.grading_service.adapter.out.persistence;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import java.util.UUID;

public interface SpringDataResolutionRepository extends ReactiveCrudRepository<ResolutionEntity, String> {
    reactor.core.publisher.Flux<ResolutionEntity> findByWorkflowId(String workflowId);
}