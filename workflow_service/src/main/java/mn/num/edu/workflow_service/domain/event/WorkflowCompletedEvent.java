package mn.num.edu.workflow_service.domain.event;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record WorkflowCompletedEvent(
        String workflowId,
        String departmentId,
        Instant occurredAt
) {}