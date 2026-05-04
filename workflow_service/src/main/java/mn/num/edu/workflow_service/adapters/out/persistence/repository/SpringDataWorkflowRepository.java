package mn.num.edu.workflow_service.adapters.out.persistence.repository;

import mn.num.edu.workflow_service.adapters.out.persistence.entity.WorkflowEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface SpringDataWorkflowRepository extends ReactiveCrudRepository<WorkflowEntity, String> {
    Mono<WorkflowEntity> findByDepartmentId(String departmentId);
    Mono<WorkflowEntity> findByStatus(String status);
}