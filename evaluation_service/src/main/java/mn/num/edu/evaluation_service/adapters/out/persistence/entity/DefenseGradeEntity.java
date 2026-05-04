package mn.num.edu.evaluation_service.adapters.out.persistence.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("defense_grade")
public class DefenseGradeEntity implements Persistable<UUID> {

    @Id
    private UUID id;
    private String defenseSessionId;
    private String thesisId;
    private String studentId;
    private String evaluatorId;
    private String evaluatorRole;
    private BigDecimal points;
    private BigDecimal maxPoints;
    private String comment;
    private Boolean isSubmitted;
    private LocalDateTime submittedAt;

    @Transient
    private boolean isNew;

    public DefenseGradeEntity() {}

    public static DefenseGradeEntity create(String defenseSessionId, String thesisId, String studentId,
                                              String evaluatorId, String evaluatorRole,
                                              BigDecimal points, BigDecimal maxPoints, String comment) {
        DefenseGradeEntity e = new DefenseGradeEntity();
        e.id = UUID.randomUUID();
        e.defenseSessionId = defenseSessionId;
        e.thesisId = thesisId;
        e.studentId = studentId;
        e.evaluatorId = evaluatorId;
        e.evaluatorRole = evaluatorRole;
        e.points = points;
        e.maxPoints = maxPoints;
        e.comment = comment;
        e.isSubmitted = false;
        e.isNew = true;
        return e;
    }

    @Override public UUID getId() { return id; }
    @Override public boolean isNew() { return isNew; }
    public void setNew(boolean n) { this.isNew = n; }

    public String getDefenseSessionId() { return defenseSessionId; }
    public String getThesisId() { return thesisId; }
    public String getStudentId() { return studentId; }
    public String getEvaluatorId() { return evaluatorId; }
    public String getEvaluatorRole() { return evaluatorRole; }
    public BigDecimal getPoints() { return points; }
    public void setPoints(BigDecimal points) { this.points = points; }
    public BigDecimal getMaxPoints() { return maxPoints; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Boolean getIsSubmitted() { return isSubmitted; }
    public void setIsSubmitted(Boolean isSubmitted) { this.isSubmitted = isSubmitted; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
