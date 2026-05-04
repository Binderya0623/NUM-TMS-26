package mn.num.edu.workflow_service.domain.event;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record WorkflowDeadlineApproachingEvent(
        String workflowId,
        String stageId,
        String stageName,
        LocalDate deadline,
        Instant occurredAt
) {}