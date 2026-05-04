package mn.num.edu.evaluation_service.domain.event;

import java.math.BigDecimal;
import java.util.UUID;

public record DefenseEvaluatedEvent(
        UUID thesisId,
        UUID stageId,
        BigDecimal defenseScore
) {}