package com.tms.thesissystem.application.service;

import com.tms.thesissystem.application.port.WorkflowRepository;
import com.tms.thesissystem.domain.model.AuditEntry;
import com.tms.thesissystem.domain.model.Notification;
import com.tms.thesissystem.domain.model.Plan;
import com.tms.thesissystem.domain.model.Review;
import com.tms.thesissystem.domain.model.Topic;
import com.tms.thesissystem.domain.model.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkflowQueryService {
    private final WorkflowRepository repository;

    public WorkflowQueryService(WorkflowRepository repository) {
        this.repository = repository;
    }

    public DashboardSnapshot getDashboard() {
        List<Topic> topics = repository.findAllTopics();
        List<Plan> plans = repository.findAllPlans();
        List<Review> reviews = repository.findAllReviews();
        return new DashboardSnapshot(
                repository.findAllUsers(),
                topics,
                plans,
                reviews,
                repository.findAllNotifications(),
                repository.findAllAuditEntries(),
                new Summary(
                        topics.stream().filter(topic -> topic.status().name().startsWith("PENDING")).count(),
                        plans.stream().filter(plan -> plan.status().name().startsWith("PENDING")).count(),
                        reviews.size()
                )
        );
    }

    public record DashboardSnapshot(
            List<User> users,
            List<Topic> topics,
            List<Plan> plans,
            List<Review> reviews,
            List<Notification> notifications,
            List<AuditEntry> auditTrail,
            Summary summary
    ) { }

    public record Summary(long pendingTopics, long pendingPlans, long totalReviews) { }
}
