package mn.num.edu.evaluation_service.adapters.out.persistence.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("final_grade_confirmation")
public class FinalGradeConfirmationEntity implements Persistable<UUID> {

    @Id
    private UUID id;
    private String studentId;
    private String thesisId;
    private String committeeId;
    private String confirmedBy;

    @Column("progress_1_score")
    private BigDecimal progress1Score;
    @Column("progress_2_score")
    private BigDecimal progress2Score;
    private BigDecimal preliminaryScore;
    private BigDecimal finalCommitteeScore;
    private BigDecimal reviewerScore;
    private BigDecimal totalScore;

    private String gradeLetter;
    private String passFail;
    private String headNotes;

    private Boolean isPublished;
    private LocalDateTime confirmedAt;
    private LocalDateTime publishedAt;

    @Transient
    private boolean isNew;

    public FinalGradeConfirmationEntity() {}

    @Override public UUID getId() { return id; }
    @Override public boolean isNew() { return isNew; }
    public void setNew(boolean n) { this.isNew = n; }
    public void setId(UUID id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getThesisId() { return thesisId; }
    public void setThesisId(String thesisId) { this.thesisId = thesisId; }
    public String getCommitteeId() { return committeeId; }
    public void setCommitteeId(String committeeId) { this.committeeId = committeeId; }
    public String getConfirmedBy() { return confirmedBy; }
    public void setConfirmedBy(String confirmedBy) { this.confirmedBy = confirmedBy; }
    public BigDecimal getProgress1Score() { return progress1Score; }
    public void setProgress1Score(BigDecimal v) { this.progress1Score = v; }
    public BigDecimal getProgress2Score() { return progress2Score; }
    public void setProgress2Score(BigDecimal v) { this.progress2Score = v; }
    public BigDecimal getPreliminaryScore() { return preliminaryScore; }
    public void setPreliminaryScore(BigDecimal v) { this.preliminaryScore = v; }
    public BigDecimal getFinalCommitteeScore() { return finalCommitteeScore; }
    public void setFinalCommitteeScore(BigDecimal v) { this.finalCommitteeScore = v; }
    public BigDecimal getReviewerScore() { return reviewerScore; }
    public void setReviewerScore(BigDecimal v) { this.reviewerScore = v; }
    public BigDecimal getTotalScore() { return totalScore; }
    public void setTotalScore(BigDecimal v) { this.totalScore = v; }
    public String getGradeLetter() { return gradeLetter; }
    public void setGradeLetter(String gradeLetter) { this.gradeLetter = gradeLetter; }
    public String getPassFail() { return passFail; }
    public void setPassFail(String passFail) { this.passFail = passFail; }
    public String getHeadNotes() { return headNotes; }
    public void setHeadNotes(String headNotes) { this.headNotes = headNotes; }
    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }
    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
}
