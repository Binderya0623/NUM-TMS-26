package mn.num.edu.workflow_service.adapters.in.web;

import mn.num.edu.workflow_service.application.dto.CreateWorkflowCommand;
import mn.num.edu.workflow_service.application.dto.CreateWorkflowStageCommand;
import mn.num.edu.workflow_service.application.dto.WorkflowResponse;
import mn.num.edu.workflow_service.application.port.in.AddWorkflowStageUseCase;
import mn.num.edu.workflow_service.application.port.in.ActivateStageUseCase;
import mn.num.edu.workflow_service.application.port.in.CloseStageUseCase;
import mn.num.edu.workflow_service.application.port.in.CreateWorkflowUseCase;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {

    private final CreateWorkflowUseCase createWorkflowUseCase;
    private final AddWorkflowStageUseCase addWorkflowStageUseCase;
    private final ActivateStageUseCase activateStageUseCase;
    private final CloseStageUseCase closeStageUseCase;

    public WorkflowController(CreateWorkflowUseCase createWorkflowUseCase,
                              AddWorkflowStageUseCase addWorkflowStageUseCase,
                              ActivateStageUseCase activateStageUseCase,
                              CloseStageUseCase closeStageUseCase) {
        this.createWorkflowUseCase = createWorkflowUseCase;
        this.addWorkflowStageUseCase = addWorkflowStageUseCase;
        this.activateStageUseCase = activateStageUseCase;
        this.closeStageUseCase = closeStageUseCase;
    }

    @PostMapping
    public Mono<WorkflowResponse> create(@RequestBody CreateWorkflowCommand command) {
        return createWorkflowUseCase.createWorkflow(command);
    }

    @PostMapping("/{workflowId}/stages")
    public Mono<WorkflowResponse> addStage(@PathVariable String workflowId,
                                           @RequestBody CreateWorkflowStageCommand command) {
        return addWorkflowStageUseCase.addStage(workflowId, command);
    }

    @PatchMapping("/{workflowId}/stages/{stageId}/activate")
    public Mono<WorkflowResponse> activate(@PathVariable String workflowId,
                                           @PathVariable String stageId) {
        return activateStageUseCase.activateStage(workflowId, stageId);
    }

    @PatchMapping("/{workflowId}/stages/{stageId}/close")
    public Mono<WorkflowResponse> close(@PathVariable String workflowId,
                                        @PathVariable String stageId) {
        return closeStageUseCase.closeStage(workflowId, stageId);
    }
}