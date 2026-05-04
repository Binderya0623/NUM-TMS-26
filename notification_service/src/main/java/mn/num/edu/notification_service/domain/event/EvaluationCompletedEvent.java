package mn.num.edu.notification_service.domain.event;

import java.time.LocalDateTime;

public record EvaluationCompletedEvent(
        String evaluationId,
        String thesisId,
        String studentId,
        String workflowId,
        String stageId,
        String stageName,
        Double totalScore,
        LocalDateTime occurredAt
) {}
