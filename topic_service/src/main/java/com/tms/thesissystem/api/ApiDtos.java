package com.tms.thesissystem.api;

import java.time.LocalDateTime;
import java.util.List;

public final class ApiDtos {
    private ApiDtos() {
    }

    public record DashboardResponse(
            List<UserDto> users,
            List<TopicDto> topics,
            List<PlanDto> plans,
            List<ReviewDto> reviews,
            List<NotificationDto> notifications,
            List<AuditEntryDto> auditTrail,
            SummaryDto summary
    ) { }

    public record SummaryDto(long pendingTopics, long pendingPlans, long totalReviews) { }

    public record UserDto(Long id, String role, String firstName, String lastName, String email, String departmentName, String program) { }

    public record TopicDto(
            Long id,
            String title,
            String description,
            String program,
            Long proposerId,
            String proposerName,
            String proposerRole,
            Long ownerStudentId,
            String ownerStudentName,
            Long advisorTeacherId,
            String advisorTeacherName,
            String status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<ApprovalRecordDto> approvals
    ) { }

    public record PlanDto(
            Long id,
            Long topicId,
            String topicTitle,
            Long studentId,
            String studentName,
            String status,
            List<WeeklyTaskDto> tasks,
            List<ApprovalRecordDto> approvals,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) { }

    public record WeeklyTaskDto(int week, String title, String deliverable, String focus) { }

    public record ApprovalRecordDto(String stage, Long actorId, String actorName, boolean approved, String note, LocalDateTime decidedAt) { }

    public record ReviewDto(Long id, Long planId, int week, Long reviewerId, String reviewerName, int score, String comment, LocalDateTime createdAt) { }

    public record NotificationDto(Long id, Long userId, String title, String message, LocalDateTime createdAt) { }

    public record AuditEntryDto(Long id, String entityType, Long entityId, String action, String actorName, String detail, LocalDateTime createdAt) { }

    public record TopicStateResponse(
            List<TopicDto> allTopics,
            List<TopicDto> availableTopics,
            List<TopicDto> pendingTeacherApprovalTopics,
            List<TopicDto> pendingDepartmentApprovalTopics,
            List<TopicDto> approvedStudentTopics,
            List<TopicDto> rejectedTopics
    ) { }

    public record PlanStateResponse(
            List<PlanDto> allPlans,
            List<PlanDto> draftPlans,
            List<PlanDto> pendingTeacherApprovalPlans,
            List<PlanDto> pendingDepartmentApprovalPlans,
            List<PlanDto> approvedPlans,
            List<PlanDto> rejectedPlans
    ) { }

    public record WorkflowStateResponse(List<UserDto> users, TopicStateResponse topics, PlanStateResponse plans) { }

    public record TopicActionResponse(TopicDto topic, WorkflowStateResponse state) { }

    public record PlanActionResponse(PlanDto plan, WorkflowStateResponse state) { }

    public record AuthUserDto(Long id, String username, String displayName, String role) { }

    public record LoginResponse(boolean ok, String message, AuthUserDto user) { }
}
