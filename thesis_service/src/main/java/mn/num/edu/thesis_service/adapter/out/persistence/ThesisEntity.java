package mn.num.edu.thesis_service.adapter.out.persistence;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("theses")
public class ThesisEntity implements Persistable<String> {

    @Id
    private String id;
    private String studentId;
    private String supervisorId;
    private String committeeId;
    private String titleMn;
    private String titleEn;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Transient
    private boolean isNew;

    public ThesisEntity(
            String id,
            String studentId,
            String supervisorId,
            String committeeId,
            String titleMn,
            String titleEn,
            String description,
            String status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.studentId = studentId;
        this.supervisorId = supervisorId;
        this.committeeId = committeeId;
        this.titleMn = titleMn;
        this.titleEn = titleEn;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isNew = false;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    public void markNew() {
        this.isNew = true;
    }

    public void markNotNew() {
        this.isNew = false;
    }

    public String getStudentId() {
        return studentId;
    }

    public String getSupervisorId() {
        return supervisorId;
    }

    public String getCommitteeId() {
        return committeeId;
    }

    public String getTitleMn() {
        return titleMn;
    }

    public String getTitleEn() {
        return titleEn;
    }

    public String getDescription() {
        return description;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}