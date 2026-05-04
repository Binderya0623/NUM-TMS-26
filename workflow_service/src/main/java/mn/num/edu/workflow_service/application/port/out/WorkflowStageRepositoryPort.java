package mn.num.edu.workflow_service.application.port.out;

import mn.num.edu.workflow_service.domain.model.Workflow;
import mn.num.edu.workflow_service.domain.model.WorkflowStage;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface WorkflowStageRepositoryPort {
    Mono<WorkflowStage> saveStage(WorkflowStage stage);
    Flux<WorkflowStage> findByWorkflowId(String workflowId);
    Mono<Void> updateStageStatus(String stageId, String status);
//    Mono<WorkflowStage> findByStatus(String status);
    Mono<WorkflowStage> findStageById(String stageId);
}