package mn.num.edu.workflow_service.domain.event;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record WorkflowCreatedEvent(
        String workflowId,
        String departmentId,
        String title,
        Instant occurredAt
) {}