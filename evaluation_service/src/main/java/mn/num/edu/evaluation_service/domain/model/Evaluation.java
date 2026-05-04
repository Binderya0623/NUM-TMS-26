package mn.num.edu.evaluation_service.domain.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Evaluation {
    private UUID id;
    private UUID thesisId;
    private UUID workflowId;
    private UUID stageId;
    private String stageName;
    private BigDecimal stageMaxPoint;
    private UUID committeeId;
    private UUID evaluatorId;
    private EvaluationStatus status;
    private final List<CriterionAssessment> criteria = new ArrayList<>();

    public Evaluation(
            UUID id,
            UUID thesisId,
            UUID workflowId,
            UUID stageId,
            String stageName,
            BigDecimal stageMaxPoint,
            UUID committeeId,
            UUID evaluatorId,
            EvaluationStatus status
    ) {
        this.id = id;
        this.thesisId = thesisId;
        this.workflowId = workflowId;
        this.stageId = stageId;
        this.stageName = stageName;
        this.stageMaxPoint = stageMaxPoint;
        this.committeeId = committeeId;
        this.evaluatorId = evaluatorId;
        this.status = status;
    }

    public void addCriterion(CriterionAssessment assessment) {
        this.criteria.add(assessment);
    }

    public void submit() {
        if (criteria.isEmpty()) {
            throw new IllegalStateException("Evaluation must contain at least one criterion");
        }
        this.status = EvaluationStatus.SUBMITTED;
    }

    public void complete() {
        this.status = EvaluationStatus.COMPLETED;
    }

    public BigDecimal totalWeightedScore() {
        return criteria.stream()
                .map(CriterionAssessment::getWeightedScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public UUID getId() {
        return id;
    }

    public UUID getThesisId() {
        return thesisId;
    }

    public UUID getWorkflowId() {
        return workflowId;
    }

    public UUID getStageId() {
        return stageId;
    }

    public String getStageName() {
        return stageName;
    }

    public BigDecimal getStageMaxPoint() {
        return stageMaxPoint;
    }

    public UUID getCommitteeId() {
        return committeeId;
    }

    public UUID getEvaluatorId() {
        return evaluatorId;
    }

    public EvaluationStatus getStatus() {
        return status;
    }

    public List<CriterionAssessment> getCriteria() {
        return criteria;
    }
}