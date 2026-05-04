package mn.num.edu.evaluation_service.application.dto;

import java.util.List;
import java.util.UUID;

public record UpdateEvaluationCommand(
        UUID evaluationId,
        List<CriterionInput> criteria
) {
    public record CriterionInput(
            UUID criterionId,
            Integer achievedPercent
    ) {}
}