package mn.num.edu.evaluation_service.domain.event;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record WorkflowStageActivatedEvent(
        UUID workflowId,
        UUID thesisId,
        UUID stageId,
        String stageName,
        BigDecimal stageMaxPoint,
        List<CriterionPayload> criteria
) {
    public record CriterionPayload(
            UUID criterionId,
            String name,
            BigDecimal maxPoint
    ) {}
}