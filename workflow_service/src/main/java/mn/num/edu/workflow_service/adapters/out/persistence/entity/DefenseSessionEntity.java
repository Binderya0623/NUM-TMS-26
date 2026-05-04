package mn.num.edu.workflow_service.adapters.out.persistence.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Table("defense_session")
public class DefenseSessionEntity implements Persistable<String> {

    @Id
    private String id;

    @Column("department_id")
    private String departmentId;

    @Column("committee_id")
    private String committeeId;

    @Column("stage_type")
    private String stageType;

    @Column("max_points")
    private BigDecimal maxPoints;

    @Column("status")
    private String status;

    @Column("supervisor_id")
    private String supervisorId;

    @Column("scheduled_date")
    private LocalDateTime scheduledDate;

    @Column("location")
    private String location;

    @Column("notes")
    private String notes;

    @Column("started_by")
    private String startedBy;

    @Column("started_at")
    private LocalDateTime startedAt;

    @Column("closed_by")
    private String closedBy;

    @Column("closed_at")
    private LocalDateTime closedAt;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Transient
    private boolean isNew;

    public DefenseSessionEntity() {}

    @Override public String getId() { return id; }
    @Override public boolean isNew() { return isNew; }

    public void setId(String id) { this.id = id; }
    public void setNew(boolean n) { this.isNew = n; }
    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }
    public String getCommitteeId() { return committeeId; }
    public void setCommitteeId(String committeeId) { this.committeeId = committeeId; }
    public String getStageType() { return stageType; }
    public void setStageType(String stageType) { this.stageType = stageType; }
    public BigDecimal getMaxPoints() { return maxPoints; }
    public void setMaxPoints(BigDecimal maxPoints) { this.maxPoints = maxPoints; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSupervisorId() { return supervisorId; }
    public void setSupervisorId(String supervisorId) { this.supervisorId = supervisorId; }
    public LocalDateTime getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDateTime scheduledDate) { this.scheduledDate = scheduledDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getStartedBy() { return startedBy; }
    public void setStartedBy(String startedBy) { this.startedBy = startedBy; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public String getClosedBy() { return closedBy; }
    public void setClosedBy(String closedBy) { this.closedBy = closedBy; }
    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
