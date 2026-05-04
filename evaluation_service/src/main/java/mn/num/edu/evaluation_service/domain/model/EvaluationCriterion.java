package mn.num.edu.evaluation_service.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

public class EvaluationCriterion {
    private UUID criterionId;
    private String name;
    private BigDecimal maxPoint;

    public EvaluationCriterion(UUID criterionId, String name, BigDecimal maxPoint) {
        this.criterionId = criterionId;
        this.name = name;
        this.maxPoint = maxPoint;
    }

    public UUID getCriterionId() {
        return criterionId;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getMaxPoint() {
        return maxPoint;
    }
}