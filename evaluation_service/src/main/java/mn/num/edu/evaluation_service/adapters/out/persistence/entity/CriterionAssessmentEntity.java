package mn.num.edu.evaluation_service.adapters.out.persistence.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Table("criterion_assessments")
public class CriterionAssessmentEntity {

    @Id
    private UUID id;
    private UUID evaluationId;
    private UUID criterionId;
    private String criterionName;
    private BigDecimal maxPoint;
    private Integer achievedPercent;
    private BigDecimal weightedScore;

    public CriterionAssessmentEntity() {}

    public CriterionAssessmentEntity(
            UUID id,
            UUID evaluationId,
            UUID criterionId,
            String criterionName,
            BigDecimal maxPoint,
            Integer achievedPercent,
            BigDecimal weightedScore
    ) {
        this.id = id;
        this.evaluationId = evaluationId;
        this.criterionId = criterionId;
        this.criterionName = criterionName;
        this.maxPoint = maxPoint;
        this.achievedPercent = achievedPercent;
        this.weightedScore = weightedScore;
    }

    public UUID getId() { return id; }
    public UUID getEvaluationId() { return evaluationId; }
    public UUID getCriterionId() { return criterionId; }
    public String getCriterionName() { return criterionName; }
    public BigDecimal getMaxPoint() { return maxPoint; }
    public Integer getAchievedPercent() { return achievedPercent; }
    public BigDecimal getWeightedScore() { return weightedScore; }
}
