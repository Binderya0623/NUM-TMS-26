package com.tms.thesissystem;

import com.tms.thesissystem.application.port.WorkflowRepository;
import com.tms.thesissystem.domain.model.ApprovalRecord;
import com.tms.thesissystem.domain.model.ApprovalStage;
import com.tms.thesissystem.domain.model.AuditEntry;
import com.tms.thesissystem.domain.model.Notification;
import com.tms.thesissystem.domain.model.Plan;
import com.tms.thesissystem.domain.model.PlanStatus;
import com.tms.thesissystem.domain.model.Review;
import com.tms.thesissystem.domain.model.Topic;
import com.tms.thesissystem.domain.model.TopicStatus;
import com.tms.thesissystem.domain.model.User;
import com.tms.thesissystem.domain.model.UserRole;
import com.tms.thesissystem.domain.model.WeeklyTask;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@TestConfiguration
public class TestWorkflowRepositoryConfig {
    @Bean
    @Primary
    WorkflowRepository workflowRepository() {
        return new TestWorkflowRepository();
    }

    static class TestWorkflowRepository implements WorkflowRepository {
        private final Map<Long, User> users = new LinkedHashMap<>();
        private final Map<Long, Topic> topics = new LinkedHashMap<>();
        private final Map<Long, Plan> plans = new LinkedHashMap<>();
        private final Map<Long, Review> reviews = new LinkedHashMap<>();
        private final Map<Long, Notification> notifications = new LinkedHashMap<>();
        private final Map<Long, AuditEntry> audits = new LinkedHashMap<>();

        private final AtomicLong topicSequence = new AtomicLong(10);
        private final AtomicLong planSequence = new AtomicLong(20);
        private final AtomicLong reviewSequence = new AtomicLong(30);
        private final AtomicLong notificationSequence = new AtomicLong(40);
        private final AtomicLong auditSequence = new AtomicLong(50);

        TestWorkflowRepository() {
            seed();
        }

        private void seed() {
            LocalDateTime now = LocalDateTime.now();

            User studentA = new User(100001L, UserRole.STUDENT, "Anu", "Bat", "anu@tms.mn", "Software Engineering", "B.SE");
            User studentB = new User(100002L, UserRole.STUDENT, "Temuulen", "Dorj", "temuulen@tms.mn", "Software Engineering", "B.SE");
            User studentC = new User(100003L, UserRole.STUDENT, "Nomin", "Erdene", "nomin@tms.mn", "Information Systems", "B.IS");
            User teacherA = new User(200001L, UserRole.TEACHER, "Enkh", "Suren", "enkh@tms.mn", "Software Engineering", null);
            User teacherB = new User(200002L, UserRole.TEACHER, "Bolor", "Naran", "bolor@tms.mn", "Software Engineering", null);
            User teacherC = new User(200003L, UserRole.TEACHER, "Saruul", "Munkh", "saruul@tms.mn", "Data Science", null);
            User departmentA = new User(300001L, UserRole.DEPARTMENT, "Software Engineering", "Department", "se@tms.mn", "Software Engineering", null);

            List.of(studentA, studentB, studentC, teacherA, teacherB, teacherC, departmentA)
                    .forEach(user -> users.put(user.id(), user));

            Topic pendingTeacherTopic = Topic.studentProposal(
                    1L,
                    "Distributed Thesis Workflow",
                    "Оюутны санал болгосон дипломын workflow automation сэдэв.",
                    "B.SE",
                    studentA,
                    now.minusDays(2)
            );

            Topic availableTeacherTopic = new Topic(
                    2L,
                    "Event-driven Student Research Tracker",
                    "Багшийн батлагдсан, оюутан сонгож болох сэдэв.",
                    "B.SE",
                    teacherA.id(),
                    teacherA.fullName(),
                    UserRole.TEACHER,
                    null,
                    null,
                    teacherA.id(),
                    teacherA.fullName(),
                    TopicStatus.AVAILABLE,
                    now.minusDays(5),
                    now.minusDays(5),
                    List.of(new ApprovalRecord(ApprovalStage.DEPARTMENT, departmentA.id(), departmentA.fullName(), true, "Catalog approved", now.minusDays(4)))
            );

            Topic availableTeacherTopicB = new Topic(
                    4L,
                    "AI-based Thesis Workflow Automation",
                    "Оюутан сонгож болох багшийн батлагдсан сэдэв.",
                    "B.SE",
                    teacherB.id(),
                    teacherB.fullName(),
                    UserRole.TEACHER,
                    null,
                    null,
                    teacherB.id(),
                    teacherB.fullName(),
                    TopicStatus.AVAILABLE,
                    now.minusDays(6),
                    now.minusDays(6),
                    List.of(new ApprovalRecord(ApprovalStage.DEPARTMENT, departmentA.id(), departmentA.fullName(), true, "Catalog approved", now.minusDays(5)))
            );

            Topic availableTeacherTopicC = new Topic(
                    5L,
                    "Data-driven Research Planning",
                    "Өгөгдөлд суурилсан судалгааны төлөвлөлтийн сэдэв.",
                    "B.DS",
                    teacherC.id(),
                    teacherC.fullName(),
                    UserRole.TEACHER,
                    null,
                    null,
                    teacherC.id(),
                    teacherC.fullName(),
                    TopicStatus.AVAILABLE,
                    now.minusDays(7),
                    now.minusDays(7),
                    List.of(new ApprovalRecord(ApprovalStage.DEPARTMENT, departmentA.id(), departmentA.fullName(), true, "Catalog approved", now.minusDays(6)))
            );

            Topic approvedStudentTopic = new Topic(
                    3L,
                    "Layered Architecture for Graduation Management",
                    "Тэнхим, багш, оюутны approval flow-тай систем.",
                    "B.SE",
                    studentB.id(),
                    studentB.fullName(),
                    UserRole.STUDENT,
                    studentB.id(),
                    studentB.fullName(),
                    teacherA.id(),
                    teacherA.fullName(),
                    TopicStatus.APPROVED,
                    now.minusDays(12),
                    now.minusDays(10),
                    List.of(
                            new ApprovalRecord(ApprovalStage.TEACHER, teacherA.id(), teacherA.fullName(), true, "Teacher approved", now.minusDays(11)),
                            new ApprovalRecord(ApprovalStage.DEPARTMENT, departmentA.id(), departmentA.fullName(), true, "Department approved", now.minusDays(10))
                    )
            );

            topics.put(1L, pendingTeacherTopic);
            topics.put(2L, availableTeacherTopic);
            topics.put(3L, approvedStudentTopic);
            topics.put(4L, availableTeacherTopicB);
            topics.put(5L, availableTeacherTopicC);

            List<WeeklyTask> seededTasks = java.util.stream.IntStream.rangeClosed(1, 15)
                    .mapToObj(week -> new WeeklyTask(week, "Week " + week, "Deliverable " + week, "Focus " + week))
                    .toList();

            Plan approvedPlan = new Plan(
                    1L,
                    approvedStudentTopic.id(),
                    approvedStudentTopic.title(),
                    studentB.id(),
                    studentB.fullName(),
                    PlanStatus.APPROVED,
                    seededTasks,
                    List.of(
                            new ApprovalRecord(ApprovalStage.TEACHER, teacherA.id(), teacherA.fullName(), true, "Teacher approved", now.minusDays(9)),
                            new ApprovalRecord(ApprovalStage.DEPARTMENT, departmentA.id(), departmentA.fullName(), true, "Department approved", now.minusDays(8))
                    ),
                    now.minusDays(10),
                    now.minusDays(8)
            );

            plans.put(1L, approvedPlan);
            reviews.put(1L, new Review(1L, approvedPlan.id(), 4, teacherA.id(), teacherA.fullName(), 92, "Судалгааны хэсэг сайн.", now.minusDays(1)));
            notifications.put(1L, new Notification(1L, studentB.id(), "Төлөвлөгөө батлагдсан", "15 долоо хоногийн төлөвлөгөөг тэнхим баталгаажууллаа.", now.minusHours(6)));
            audits.put(1L, new AuditEntry(1L, "PLAN", approvedPlan.id(), "PLAN_APPROVED", departmentA.fullName(), "Тэнхим төлөвлөгөөг эцэслэн баталлаа.", now.minusHours(6)));
        }

        @Override
        public List<User> findAllUsers() {
            return users.values().stream().sorted(Comparator.comparing(User::id)).toList();
        }

        @Override
        public List<User> findUsersByRole(UserRole role) {
            return users.values().stream().filter(user -> user.role() == role).sorted(Comparator.comparing(User::id)).toList();
        }

        @Override
        public Optional<User> findUserById(Long id) {
            return Optional.ofNullable(users.get(id));
        }

        @Override
        public Long nextTopicId() {
            return topicSequence.getAndIncrement();
        }

        @Override
        public List<Topic> findAllTopics() {
            return topics.values().stream().sorted(Comparator.comparing(Topic::updatedAt).reversed()).toList();
        }

        @Override
        public Optional<Topic> findTopicById(Long id) {
            return Optional.ofNullable(topics.get(id));
        }

        @Override
        public Topic saveTopic(Topic topic) {
            topics.put(topic.id(), topic);
            return topic;
        }

        @Override
        public Long nextPlanId() {
            return planSequence.getAndIncrement();
        }

        @Override
        public List<Plan> findAllPlans() {
            return plans.values().stream().sorted(Comparator.comparing(Plan::updatedAt).reversed()).toList();
        }

        @Override
        public Optional<Plan> findPlanById(Long id) {
            return Optional.ofNullable(plans.get(id));
        }

        @Override
        public Optional<Plan> findPlanByStudentId(Long studentId) {
            return plans.values().stream().filter(plan -> plan.studentId().equals(studentId)).findFirst();
        }

        @Override
        public Plan savePlan(Plan plan) {
            plans.put(plan.id(), plan);
            return plan;
        }

        @Override
        public Long nextReviewId() {
            return reviewSequence.getAndIncrement();
        }

        @Override
        public List<Review> findAllReviews() {
            return new ArrayList<>(reviews.values());
        }

        @Override
        public Review saveReview(Review review) {
            reviews.put(review.id(), review);
            return review;
        }

        @Override
        public Long nextNotificationId() {
            return notificationSequence.getAndIncrement();
        }

        @Override
        public List<Notification> findAllNotifications() {
            return new ArrayList<>(notifications.values());
        }

        @Override
        public Notification saveNotification(Notification notification) {
            notifications.put(notification.id(), notification);
            return notification;
        }

        @Override
        public Long nextAuditId() {
            return auditSequence.getAndIncrement();
        }

        @Override
        public List<AuditEntry> findAllAuditEntries() {
            return new ArrayList<>(audits.values());
        }

        @Override
        public AuditEntry saveAuditEntry(AuditEntry auditEntry) {
            audits.put(auditEntry.id(), auditEntry);
            return auditEntry;
        }
    }
}
