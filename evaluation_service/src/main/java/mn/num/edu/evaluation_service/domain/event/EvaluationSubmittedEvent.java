package mn.num.edu.evaluation_service.domain.event;

import java.math.BigDecimal;
import java.util.UUID;

public record EvaluationSubmittedEvent(
        UUID evaluationId,
        UUID thesisId,
        UUID stageId,
        UUID evaluatorId,
        BigDecimal totalScore
) {}