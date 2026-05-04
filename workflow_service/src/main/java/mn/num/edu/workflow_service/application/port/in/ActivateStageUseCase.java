package mn.num.edu.workflow_service.application.port.in;

import mn.num.edu.workflow_service.application.dto.WorkflowResponse;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface ActivateStageUseCase {
    Mono<WorkflowResponse> activateStage(String workflowId, String stageId);
}