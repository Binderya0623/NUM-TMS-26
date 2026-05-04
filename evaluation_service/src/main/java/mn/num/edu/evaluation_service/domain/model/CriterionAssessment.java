package mn.num.edu.evaluation_service.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

public class CriterionAssessment {
    private UUID criterionId;
    private String criterionName;
    private BigDecimal maxPoint;
    private Integer achievedPercent; // 0..100
    private BigDecimal weightedScore;

    public CriterionAssessment(
            UUID criterionId,
            String criterionName,
            BigDecimal maxPoint,
            Integer achievedPercent
    ) {
        validatePercent(achievedPercent);
        this.criterionId = criterionId;
        this.criterionName = criterionName;
        this.maxPoint = maxPoint;
        this.achievedPercent = achievedPercent;
        this.weightedScore = calculateWeightedScore(maxPoint, achievedPercent);
    }

    private void validatePercent(Integer percent) {
        if (percent == null || percent < 0 || percent > 100) {
            throw new IllegalArgumentException("achievedPercent must be between 0 and 100");
        }
    }

    private BigDecimal calculateWeightedScore(BigDecimal maxPoint, Integer percent) {
        return maxPoint
                .multiply(BigDecimal.valueOf(percent))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    public void updatePercent(Integer newPercent) {
        validatePercent(newPercent);
        this.achievedPercent = newPercent;
        this.weightedScore = calculateWeightedScore(this.maxPoint, newPercent);
    }

    public UUID getCriterionId() {
        return criterionId;
    }

    public String getCriterionName() {
        return criterionName;
    }

    public BigDecimal getMaxPoint() {
        return maxPoint;
    }

    public Integer getAchievedPercent() {
        return achievedPercent;
    }

    public BigDecimal getWeightedScore() {
        return weightedScore;
    }
}