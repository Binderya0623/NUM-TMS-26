package com.tms.thesissystem.application.port;

import com.tms.thesissystem.domain.model.AuditEntry;
import com.tms.thesissystem.domain.model.Notification;
import com.tms.thesissystem.domain.model.Plan;
import com.tms.thesissystem.domain.model.Review;
import com.tms.thesissystem.domain.model.Topic;
import com.tms.thesissystem.domain.model.User;
import com.tms.thesissystem.domain.model.UserRole;

import java.util.List;
import java.util.Optional;

public interface WorkflowRepository {
    List<User> findAllUsers();
    List<User> findUsersByRole(UserRole role);
    Optional<User> findUserById(Long id);
    Long nextTopicId();
    List<Topic> findAllTopics();
    Optional<Topic> findTopicById(Long id);
    Topic saveTopic(Topic topic);
    Long nextPlanId();
    List<Plan> findAllPlans();
    Optional<Plan> findPlanById(Long id);
    Optional<Plan> findPlanByStudentId(Long studentId);
    Plan savePlan(Plan plan);
    Long nextReviewId();
    List<Review> findAllReviews();
    Review saveReview(Review review);
    Long nextNotificationId();
    List<Notification> findAllNotifications();
    Notification saveNotification(Notification notification);
    Long nextAuditId();
    List<AuditEntry> findAllAuditEntries();
    AuditEntry saveAuditEntry(AuditEntry auditEntry);
}
