package mn.num.edu.workflow_service.application.port.in;

import mn.num.edu.workflow_service.application.dto.CreateWorkflowCommand;
import mn.num.edu.workflow_service.application.dto.WorkflowResponse;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface CreateWorkflowUseCase {
    Mono<WorkflowResponse> createWorkflow(CreateWorkflowCommand command);
}