package mn.num.edu.workflow_service.application.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record WorkflowResponse(
        String workflowId,
        String departmentId,
        String title,
        String status,
        List<StageItem> stages
) {
    public record StageItem(
            String stageId,
            String name,
            LocalDate startDate,
            LocalDate endDate,
            double weightPercent,
            String status
    ) {}
}