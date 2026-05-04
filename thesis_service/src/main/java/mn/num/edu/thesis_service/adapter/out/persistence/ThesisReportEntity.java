package mn.num.edu.thesis_service.adapter.out.persistence;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("thesis_report")
public class ThesisReportEntity implements Persistable<String> {

    @Id
    private String id;
    private String thesisId;
    private String studentId;
    private String defenseSessionId;
    private String reportType;
    private Integer submissionNumber;
    private String status;
    private String supervisorNotes;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;

    @Transient
    private boolean isNew;

    public ThesisReportEntity() {}

    @Override public String getId() { return id; }
    @Override public boolean isNew() { return isNew; }

    public void setId(String id) { this.id = id; }
    public void setNew(boolean n) { this.isNew = n; }
    public String getThesisId() { return thesisId; }
    public void setThesisId(String thesisId) { this.thesisId = thesisId; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getDefenseSessionId() { return defenseSessionId; }
    public void setDefenseSessionId(String defenseSessionId) { this.defenseSessionId = defenseSessionId; }
    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }
    public Integer getSubmissionNumber() { return submissionNumber; }
    public void setSubmissionNumber(Integer submissionNumber) { this.submissionNumber = submissionNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSupervisorNotes() { return supervisorNotes; }
    public void setSupervisorNotes(String supervisorNotes) { this.supervisorNotes = supervisorNotes; }
    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
