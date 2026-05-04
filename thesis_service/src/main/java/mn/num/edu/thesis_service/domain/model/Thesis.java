package mn.num.edu.thesis_service.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;

import java.time.LocalDateTime;
import java.util.UUID;

public class Thesis implements Persistable<String> {

    @Id
    private String id;
    private String studentId;
    private String supervisorId;
    private String committeeId;
    private String titleMn;
    private String titleEn;
    private String description;
    private ThesisStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Transient
    private boolean isNew;

    public Thesis(
            String id,
            String studentId,
            String supervisorId,
            String committeeId,
            String titleMn,
            String titleEn,
            String description,
            ThesisStatus status,
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

    public static Thesis create(
            String studentId,
            String titleMn,
            String titleEn,
            String description,
            String supervisorId,
            String committeeId
    ) {
        LocalDateTime now = LocalDateTime.now();

        Thesis thesis = new Thesis(
                UUID.randomUUID().toString(),
                studentId,
                supervisorId,
                committeeId,
                titleMn,
                titleEn,
                description,
                ThesisStatus.SUBMITTED,
                now,
                now
        );

        thesis.isNew = true;
        return thesis;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    public void markNotNew() {
        this.isNew = false;
    }

    public void update(String titleMn, String titleEn, String description) {
        this.titleMn = titleMn;
        this.titleEn = titleEn;
        this.description = description;
        this.updatedAt = LocalDateTime.now();
        this.isNew = false;
    }

    public void assignSupervisor(String supervisorId) {
        this.supervisorId = supervisorId;
        this.updatedAt = LocalDateTime.now();
        this.isNew = false;
    }

    public void assignCommittee(String committeeId) {
        this.committeeId = committeeId;
        this.updatedAt = LocalDateTime.now();
        this.isNew = false;
    }
    public void submitted() {
        if (this.status == ThesisStatus.REJECTED) {
            throw new IllegalStateException("Rejected thesis cannot be submitted directly.");
        }
        this.status = ThesisStatus.SUBMITTED;
        this.updatedAt = LocalDateTime.now();
        this.isNew = false;
    }

    public void approve() {
        if (this.status == ThesisStatus.REJECTED) {
            throw new IllegalStateException("Rejected thesis cannot be approved directly.");
        }
        this.status = ThesisStatus.APPROVED;
        this.updatedAt = LocalDateTime.now();
        this.isNew = false;
    }

    public void reject() {
        if (this.status == ThesisStatus.APPROVED) {
            throw new IllegalStateException("Approved thesis cannot be rejected directly.");
        }
        this.status = ThesisStatus.REJECTED;
        this.updatedAt = LocalDateTime.now();
        this.isNew = false;
    }

    public void changeStatus(ThesisStatus newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
        this.isNew = false;
    }
    public void markNew() {
        this.isNew = true;
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

    public ThesisStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}