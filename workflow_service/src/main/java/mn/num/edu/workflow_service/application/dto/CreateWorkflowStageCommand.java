package mn.num.edu.workflow_service.application.dto;

import java.time.LocalDate;

public record CreateWorkflowStageCommand(
        String name,
        LocalDate startDate,
        LocalDate endDate,
        double weightPercent,
        int stageOrder
){}
