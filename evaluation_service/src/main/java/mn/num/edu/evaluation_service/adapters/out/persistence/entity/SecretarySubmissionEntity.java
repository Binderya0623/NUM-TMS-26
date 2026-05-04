package mn.num.edu.evaluation_service.adapters.out.persistence.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("secretary_submission")
public class SecretarySubmissionEntity implements Persistable<UUID> {

    @Id
    private UUID id;
    private String defenseSessionId;
    private String committeeId;
    private String studentId;
    private String secretaryId;
    private BigDecimal averageScore;
    private Integer totalEvaluators;
    private LocalDateTime submittedAt;

    @Transient
    private boolean isNew;

    public SecretarySubmissionEntity() {}

    public static SecretarySubmissionEntity create(String defenseSessionId, String committeeId,
                                                    String studentId, String secretaryId,
                                                    BigDecimal averageScore, Integer totalEvaluators) {
        SecretarySubmissionEntity e = new SecretarySubmissionEntity();
        e.id = UUID.randomUUID();
        e.defenseSessionId = defenseSessionId;
        e.committeeId = committeeId;
        e.studentId = studentId;
        e.secretaryId = secretaryId;
        e.averageScore = averageScore;
        e.totalEvaluators = totalEvaluators;
        e.submittedAt = LocalDateTime.now();
        e.isNew = true;
        return e;
    }

    @Override public UUID getId() { return id; }
    @Override public boolean isNew() { return isNew; }

    public String getDefenseSessionId() { return defenseSessionId; }
    public String getCommitteeId() { return committeeId; }
    public String getStudentId() { return studentId; }
    public String getSecretaryId() { return secretaryId; }
    public BigDecimal getAverageScore() { return averageScore; }
    public Integer getTotalEvaluators() { return totalEvaluators; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
}
