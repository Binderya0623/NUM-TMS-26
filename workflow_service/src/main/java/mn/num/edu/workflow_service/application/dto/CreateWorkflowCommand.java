package mn.num.edu.workflow_service.application.dto;


import java.util.List;
import java.util.UUID;

public record CreateWorkflowCommand(
        String departmentId,
        String title
//        List<WorkflowStageRequest> stages
) {}