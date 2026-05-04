package mn.num.edu.notification_service.domain.event;

import java.time.LocalDateTime;

public record FinalGradeCalculatedEvent(
        String thesisId,
        String studentId,
        String workflowId,
        Double totalScore,
        String status,
        LocalDateTime occurredAt
) {}
