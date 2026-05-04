package mn.num.edu.evaluation_service.adapters.out.persistence.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Table("evaluations")
public class EvaluationEntity {

    @Id
    private UUID id;
    private UUID thesisId;
    private UUID workflowId;
    private UUID stageId;
    private String stageName;
    private BigDecimal stageMaxPoint;
    private UUID committeeId;
    private UUID evaluatorId;
    private String status;

    public EvaluationEntity() {}

    public EvaluationEntity(
            UUID id,
            UUID thesisId,
            UUID workflowId,
            UUID stageId,
            String stageName,
            BigDecimal stageMaxPoint,
            UUID committeeId,
            UUID evaluatorId,
            String status
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

    public UUID getId() { return id; }
    public UUID getThesisId() { return thesisId; }
    public UUID getWorkflowId() { return workflowId; }
    public UUID getStageId() { return stageId; }
    public String getStageName() { return stageName; }
    public BigDecimal getStageMaxPoint() { return stageMaxPoint; }
    public UUID getCommitteeId() { return committeeId; }
    public UUID getEvaluatorId() { return evaluatorId; }
    public String getStatus() { return status; }
}