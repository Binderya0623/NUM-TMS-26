package mn.num.edu.workflow_service.adapters.out.persistence.repository;

import mn.num.edu.workflow_service.adapters.out.persistence.entity.WorkflowStageEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface SpringDataWorkflowStageRepository extends ReactiveCrudRepository<WorkflowStageEntity, String> {
    Flux<WorkflowStageEntity> findByWorkflowId(String workflowId);
    Mono<WorkflowStageEntity> findByStatus(String status);

}