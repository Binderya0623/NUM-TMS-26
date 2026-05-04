package mn.num.edu.workflow_service.domain.event;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record WorkflowStageCreatedEvent(
        String workflowId,
        String stageId,
        String stageName,
        LocalDate startDate,
        LocalDate endDate,
        double weightPercent,
        Instant occurredAt
) {}
