package com.tms.thesissystem.api;

import com.tms.thesissystem.application.service.WorkflowQueryService;
import com.tms.thesissystem.domain.model.ApprovalRecord;
import com.tms.thesissystem.domain.model.AuditEntry;
import com.tms.thesissystem.domain.model.Notification;
import com.tms.thesissystem.domain.model.Plan;
import com.tms.thesissystem.domain.model.PlanStatus;
import com.tms.thesissystem.domain.model.Review;
import com.tms.thesissystem.domain.model.Topic;
import com.tms.thesissystem.domain.model.TopicStatus;
import com.tms.thesissystem.domain.model.User;
import com.tms.thesissystem.domain.model.WeeklyTask;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ApiResponseMapper {
    public ApiDtos.DashboardResponse toDashboardResponse(WorkflowQueryService.DashboardSnapshot snapshot) {
        return new ApiDtos.DashboardResponse(
                snapshot.users().stream().map(this::toUserDto).toList(),
                snapshot.topics().stream().map(this::toTopicDto).toList(),
                snapshot.plans().stream().map(this::toPlanDto).toList(),
                snapshot.reviews().stream().map(this::toReviewDto).toList(),
                snapshot.notifications().stream().map(this::toNotificationDto).toList(),
                snapshot.auditTrail().stream().map(this::toAuditEntryDto).toList(),
                new ApiDtos.SummaryDto(
                        snapshot.summary().pendingTopics(),
                        snapshot.summary().pendingPlans(),
                        snapshot.summary().totalReviews()
                )
        );
    }

    public ApiDtos.WorkflowStateResponse toWorkflowStateResponse(WorkflowQueryService.DashboardSnapshot snapshot) {
        List<ApiDtos.TopicDto> topics = snapshot.topics().stream().map(this::toTopicDto).toList();
        List<ApiDtos.PlanDto> plans = snapshot.plans().stream().map(this::toPlanDto).toList();
        return new ApiDtos.WorkflowStateResponse(
                snapshot.users().stream().map(this::toUserDto).toList(),
                new ApiDtos.TopicStateResponse(
                        topics,
                        filterTopics(topics, TopicStatus.AVAILABLE),
                        filterTopics(topics, TopicStatus.PENDING_TEACHER_APPROVAL),
                        filterTopics(topics, TopicStatus.PENDING_DEPARTMENT_APPROVAL),
                        filterTopics(topics, TopicStatus.APPROVED),
                        filterTopics(topics, TopicStatus.REJECTED)
                ),
                new ApiDtos.PlanStateResponse(
                        plans,
                        filterPlans(plans, PlanStatus.DRAFT),
                        filterPlans(plans, PlanStatus.PENDING_TEACHER_APPROVAL),
                        filterPlans(plans, PlanStatus.PENDING_DEPARTMENT_APPROVAL),
                        filterPlans(plans, PlanStatus.APPROVED),
                        filterPlans(plans, PlanStatus.REJECTED)
                )
        );
    }

    public ApiDtos.UserDto toUserDto(User user) {
        return new ApiDtos.UserDto(user.id(), user.role().name(), user.firstName(), user.lastName(), user.email(), user.departmentName(), user.program());
    }

    public ApiDtos.TopicDto toTopicDto(Topic topic) {
        String exposedStatus = topic.status() == TopicStatus.AVAILABLE ? TopicStatus.APPROVED.name() : topic.status().name();
        return new ApiDtos.TopicDto(
                topic.id(),
                topic.title(),
                topic.description(),
                topic.program(),
                topic.proposerId(),
                topic.proposerName(),
                topic.proposerRole().name(),
                topic.ownerStudentId(),
                topic.ownerStudentName(),
                topic.advisorTeacherId(),
                topic.advisorTeacherName(),
                exposedStatus,
                topic.createdAt(),
                topic.updatedAt(),
                topic.approvals().stream().map(this::toApprovalRecordDto).toList()
        );
    }

    public ApiDtos.PlanDto toPlanDto(Plan plan) {
        return new ApiDtos.PlanDto(
                plan.id(),
                plan.topicId(),
                plan.topicTitle(),
                plan.studentId(),
                plan.studentName(),
                plan.status().name(),
                plan.tasks().stream().map(this::toWeeklyTaskDto).toList(),
                plan.approvals().stream().map(this::toApprovalRecordDto).toList(),
                plan.createdAt(),
                plan.updatedAt()
        );
    }

    public ApiDtos.ReviewDto toReviewDto(Review review) {
        return new ApiDtos.ReviewDto(review.id(), review.planId(), review.week(), review.reviewerId(), review.reviewerName(), review.score(), review.comment(), review.createdAt());
    }

    public ApiDtos.NotificationDto toNotificationDto(Notification notification) {
        return new ApiDtos.NotificationDto(notification.id(), notification.userId(), notification.title(), notification.message(), notification.createdAt());
    }

    public ApiDtos.AuditEntryDto toAuditEntryDto(AuditEntry auditEntry) {
        return new ApiDtos.AuditEntryDto(auditEntry.id(), auditEntry.entityType(), auditEntry.entityId(), auditEntry.action(), auditEntry.actorName(), auditEntry.detail(), auditEntry.createdAt());
    }

    private ApiDtos.WeeklyTaskDto toWeeklyTaskDto(WeeklyTask task) {
        return new ApiDtos.WeeklyTaskDto(task.week(), task.title(), task.deliverable(), task.focus());
    }

    private ApiDtos.ApprovalRecordDto toApprovalRecordDto(ApprovalRecord record) {
        return new ApiDtos.ApprovalRecordDto(record.stage().name(), record.actorId(), record.actorName(), record.approved(), record.note(), record.decidedAt());
    }

    private List<ApiDtos.TopicDto> filterTopics(List<ApiDtos.TopicDto> topics, TopicStatus status) {
        return topics.stream().filter(topic -> status.name().equals(topic.status())).toList();
    }

    private List<ApiDtos.PlanDto> filterPlans(List<ApiDtos.PlanDto> plans, PlanStatus status) {
        return plans.stream().filter(plan -> status.name().equals(plan.status())).toList();
    }
}
