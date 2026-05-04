package mn.num.edu.workflow_service.application.port.out;

import mn.num.edu.workflow_service.adapters.out.persistence.entity.WorkflowEntity;
import mn.num.edu.workflow_service.adapters.out.persistence.entity.WorkflowStageEntity;
import mn.num.edu.workflow_service.domain.model.Workflow;
import mn.num.edu.workflow_service.domain.model.WorkflowStage;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface WorkflowRepositoryPort {
    Mono<Workflow> findWorkflowById(String id);
    Flux<WorkflowEntity> findAll();
    Mono<Workflow> findByDepartmentId(String departmentId);
    Mono<Workflow> saveWorkflow(Workflow workflow);

//    Mono<Workflow> findByStatus(String status);

    Mono<Workflow> findById(String workflowId);
}