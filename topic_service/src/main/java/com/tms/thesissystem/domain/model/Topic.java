package com.tms.thesissystem.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Topic {
    private final Long id;
    private final String title;
    private final String description;
    private final String program;
    private final Long proposerId;
    private final String proposerName;
    private final UserRole proposerRole;
    private Long ownerStudentId;
    private String ownerStudentName;
    private Long advisorTeacherId;
    private String advisorTeacherName;
    private TopicStatus status;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private final List<ApprovalRecord> approvals;

    public Topic(Long id, String title, String description, String program, Long proposerId, String proposerName,
                 UserRole proposerRole, Long ownerStudentId, String ownerStudentName, Long advisorTeacherId,
                 String advisorTeacherName, TopicStatus status, LocalDateTime createdAt, LocalDateTime updatedAt,
                 List<ApprovalRecord> approvals) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.program = program;
        this.proposerId = proposerId;
        this.proposerName = proposerName;
        this.proposerRole = proposerRole;
        this.ownerStudentId = ownerStudentId;
        this.ownerStudentName = ownerStudentName;
        this.advisorTeacherId = advisorTeacherId;
        this.advisorTeacherName = advisorTeacherName;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.approvals = approvals == null ? new ArrayList<>() : new ArrayList<>(approvals);
    }

    public static Topic teacherCatalogTopic(Long id, String title, String description, String program, User teacher, LocalDateTime now) {
        return new Topic(id, title, description, program, teacher.id(), teacher.fullName(), teacher.role(),
                null, null, teacher.id(), teacher.fullName(), TopicStatus.PENDING_DEPARTMENT_APPROVAL, now, now, List.of());
    }

    public static Topic studentProposal(Long id, String title, String description, String program, User student, LocalDateTime now) {
        return new Topic(id, title, description, program, student.id(), student.fullName(), student.role(),
                student.id(), student.fullName(), null, null, TopicStatus.PENDING_TEACHER_APPROVAL, now, now, List.of());
    }

    public void claim(User student, LocalDateTime now) {
        if (status != TopicStatus.AVAILABLE) {
            throw new IllegalStateException("Сонгох боломжтой сэдэв биш байна.");
        }
        ownerStudentId = student.id();
        ownerStudentName = student.fullName();
        status = TopicStatus.PENDING_TEACHER_APPROVAL;
        updatedAt = now;
    }

    public void teacherDecision(User teacher, boolean approved, String note, LocalDateTime now) {
        if (status != TopicStatus.PENDING_TEACHER_APPROVAL) {
            throw new IllegalStateException("Багшийн баталгаажуулалт хүлээж байгаа сэдэв биш байна.");
        }
        approvals.add(new ApprovalRecord(ApprovalStage.TEACHER, teacher.id(), teacher.fullName(), approved, note, now));
        if (approved) {
            status = TopicStatus.PENDING_DEPARTMENT_APPROVAL;
        } else if (proposerRole == UserRole.TEACHER && ownerStudentId != null) {
            releaseToCatalog();
        } else {
            status = TopicStatus.REJECTED;
        }
        updatedAt = now;
    }

    public void departmentDecision(User departmentUser, boolean approved, Long advisorTeacherId, String advisorTeacherName, String note, LocalDateTime now) {
        if (status != TopicStatus.PENDING_DEPARTMENT_APPROVAL) {
            throw new IllegalStateException("Тэнхимийн баталгаажуулалт хүлээж байгаа сэдэв биш байна.");
        }
        approvals.add(new ApprovalRecord(ApprovalStage.DEPARTMENT, departmentUser.id(), departmentUser.fullName(), approved, note, now));
        if (approved) {
            if (ownerStudentId == null) {
                this.status = TopicStatus.AVAILABLE;
                updatedAt = now;
                return;
            }
            if (advisorTeacherId == null || advisorTeacherName == null || advisorTeacherName.isBlank()) {
                throw new IllegalArgumentException("Удирдагч багшийг заавал томилно.");
            }
            this.advisorTeacherId = advisorTeacherId;
            this.advisorTeacherName = advisorTeacherName;
            this.status = TopicStatus.APPROVED;
        } else {
            if (proposerRole == UserRole.TEACHER && ownerStudentId != null) {
                releaseToCatalog();
            } else {
                this.status = TopicStatus.REJECTED;
            }
        }
        updatedAt = now;
    }

    public void supersede(LocalDateTime now) {
        ownerStudentId = null;
        ownerStudentName = null;
        advisorTeacherId = null;
        advisorTeacherName = null;
        status = TopicStatus.SUPERSEDED;
        updatedAt = now;
    }

    private void releaseToCatalog() {
        ownerStudentId = null;
        ownerStudentName = null;
        status = TopicStatus.AVAILABLE;
    }

    public Long id() { return id; }
    public Long getId() { return id; }
    public String title() { return title; }
    public String getTitle() { return title; }
    public String description() { return description; }
    public String getDescription() { return description; }
    public String program() { return program; }
    public String getProgram() { return program; }
    public Long proposerId() { return proposerId; }
    public Long getProposerId() { return proposerId; }
    public String proposerName() { return proposerName; }
    public String getProposerName() { return proposerName; }
    public UserRole proposerRole() { return proposerRole; }
    public UserRole getProposerRole() { return proposerRole; }
    public Long ownerStudentId() { return ownerStudentId; }
    public Long getOwnerStudentId() { return ownerStudentId; }
    public String ownerStudentName() { return ownerStudentName; }
    public String getOwnerStudentName() { return ownerStudentName; }
    public Long advisorTeacherId() { return advisorTeacherId; }
    public Long getAdvisorTeacherId() { return advisorTeacherId; }
    public String advisorTeacherName() { return advisorTeacherName; }
    public String getAdvisorTeacherName() { return advisorTeacherName; }
    public TopicStatus status() { return status; }
    public TopicStatus getStatus() { return status; }
    public LocalDateTime createdAt() { return createdAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime updatedAt() { return updatedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<ApprovalRecord> approvals() { return List.copyOf(approvals); }
    public List<ApprovalRecord> getApprovals() { return List.copyOf(approvals); }
}
