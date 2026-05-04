package mn.num.edu.notification_service.domain.event;

import java.time.LocalDateTime;

public record WorkflowDeadlineSetEvent(
        String workflowId,
        String thesisId,
        String studentId,
        String stageName,
        LocalDateTime deadline
) {}
