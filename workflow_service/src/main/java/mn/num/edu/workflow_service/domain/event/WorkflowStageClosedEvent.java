package mn.num.edu.workflow_service.domain.event;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record WorkflowStageClosedEvent(

        String workflowId,
        String stageId,
        String stageName,
        Instant occurredAt
) {}