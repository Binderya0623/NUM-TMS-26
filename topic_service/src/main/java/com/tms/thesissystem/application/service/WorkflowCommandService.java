package com.tms.thesissystem.application.service;

import com.tms.thesissystem.application.event.WorkflowEvent;
import com.tms.thesissystem.application.port.WorkflowEventPublisher;
import com.tms.thesissystem.application.port.WorkflowRepository;
import com.tms.thesissystem.domain.model.Plan;
import com.tms.thesissystem.domain.model.PlanStatus;
import com.tms.thesissystem.domain.model.ApprovalRecord;
import com.tms.thesissystem.domain.model.ApprovalStage;
import com.tms.thesissystem.domain.model.Review;
import com.tms.thesissystem.domain.model.Topic;
import com.tms.thesissystem.domain.model.TopicStatus;
import com.tms.thesissystem.domain.model.User;
import com.tms.thesissystem.domain.model.UserRole;
import com.tms.thesissystem.domain.model.WeeklyTask;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class WorkflowCommandService {
    private static final long STUDENT_OFFSET = 100_000L;
    private static final long TEACHER_OFFSET = 200_000L;
    private static final long DEPARTMENT_OFFSET = 300_000L;

    private final WorkflowRepository repository;
    private final WorkflowEventPublisher eventPublisher;

    public WorkflowCommandService(WorkflowRepository repository, WorkflowEventPublisher eventPublisher) {
        this.repository = repository;
        this.eventPublisher = eventPublisher;
    }

    public Topic proposeTopic(Long studentId, String title, String description, String program) {
        User student = getUser(studentId, UserRole.STUDENT);
        Topic topic = Topic.studentProposal(repository.nextTopicId(), title, description, program, student, LocalDateTime.now());
        topic = repository.saveTopic(topic);
        publish(topicEvent(topic, "TOPIC_PROPOSED", student.fullName(), "Оюутан шинэ сэдэв дэвшүүллээ.",
                "Шинэ сэдэв баталгаажуулалт хүлээж байна", student.fullName() + " шинэ дипломын сэдэв дэвшүүллээ.", userIdsByRole(UserRole.TEACHER)));
        return topic;
    }

    public Topic createTeacherTopic(Long teacherId, String title, String description, String program) {
        User teacher = getUser(teacherId, UserRole.TEACHER);
        Topic topic = Topic.teacherCatalogTopic(repository.nextTopicId(), title, description, program, teacher, LocalDateTime.now());
        topic = repository.saveTopic(topic);
        publish(topicEvent(topic, "TOPIC_PROPOSED_BY_TEACHER", teacher.fullName(), "Багш шинэ сэдэв дэвшүүллээ.",
                "Шинэ багшийн сэдэв тэнхимийн баталгаажуулалт хүлээж байна", teacher.fullName() + " шинэ сэдэв дэвшүүллээ.",
                userIdsByRole(UserRole.DEPARTMENT)));
        return topic;
    }

    public Topic claimTopic(Long topicId, Long studentId) {
        User student = getUser(studentId, UserRole.STUDENT);
        Topic topic = getTopic(topicId);
        topic.claim(student, LocalDateTime.now());
        topic = repository.saveTopic(topic);
        publish(topicEvent(topic, "TOPIC_CLAIMED", student.fullName(), "Оюутан бэлэн сэдвийг сонголоо.",
                "Сонгосон сэдэв баталгаажуулалт хүлээж байна", student.fullName() + " \"" + topic.title() + "\" сэдвийг сонголоо.", userIdsByRole(UserRole.TEACHER)));
        return topic;
    }

    public Topic teacherDecisionOnTopic(Long topicId, Long teacherId, boolean approved, String note) {
        User teacher = getUser(teacherId, UserRole.TEACHER);
        Topic topic = getTopic(topicId);
        Long previousOwnerStudentId = topic.ownerStudentId();
        topic.teacherDecision(teacher, approved, note, LocalDateTime.now());
        topic = repository.saveTopic(topic);
        publish(topicEvent(topic, approved ? "TOPIC_APPROVED_BY_TEACHER" : "TOPIC_REJECTED_BY_TEACHER", teacher.fullName(),
                approved ? "Багш сэдвийг тэнхим рүү дамжууллаа." : "Багш сэдвийг буцаалаа.",
                approved ? "Сэдэв тэнхимийн баталгаажуулалт руу шилжлээ" : "Сэдэв буцаагдлаа",
                approved ? "\"" + topic.title() + "\" сэдвийг тэнхимийн баталгаажуулалт руу шилжүүллээ."
                        : "\"" + topic.title() + "\" сэдвийг буцаалаа. Тайлбар: " + safeNote(note),
                approved ? userIdsByRole(UserRole.DEPARTMENT)
                        : previousOwnerStudentId == null ? List.of() : List.of(previousOwnerStudentId)));
        return topic;
    }

    public Topic departmentDecisionOnTopic(Long topicId, Long departmentId, boolean approved, Long advisorTeacherId, String note) {
        User department = getUser(departmentId, UserRole.DEPARTMENT);
        Topic topic = getTopic(topicId);
        Long previousOwnerStudentId = topic.ownerStudentId();
        boolean requiresAdvisorAssignment = approved && topic.ownerStudentId() != null;
        User advisor = null;
        if (approved && advisorTeacherId != null) {
            advisor = getUser(advisorTeacherId, UserRole.TEACHER);
        }
        if (requiresAdvisorAssignment && advisor == null) {
            advisor = topic.approvals().stream()
                    .filter(record -> record.stage() == ApprovalStage.TEACHER)
                    .filter(ApprovalRecord::approved)
                    .reduce((first, second) -> second)
                    .map(record -> getUser(record.actorId(), UserRole.TEACHER))
                    .orElse(null);
        }
        if (requiresAdvisorAssignment && advisor == null) {
            throw new IllegalArgumentException("Оюутны сэдэв дээр удирдагч багшийг заавал томилно.");
        }
        topic.departmentDecision(department, approved, advisor == null ? null : advisor.id(), advisor == null ? null : advisor.fullName(), note, LocalDateTime.now());
        topic = repository.saveTopic(topic);
        if (approved && topic.ownerStudentId() != null) {
            supersedePreviousTopics(topic);
        }
        List<Long> recipients = new ArrayList<>();
        if (topic.ownerStudentId() != null) recipients.add(topic.ownerStudentId());
        else if (previousOwnerStudentId != null) recipients.add(previousOwnerStudentId);
        if (approved && advisor != null) recipients.add(advisor.id());
        if (approved && topic.ownerStudentId() == null) {
            recipients.addAll(userIdsByRole(UserRole.STUDENT));
            recipients.add(topic.proposerId());
        }
        if (!approved && topic.ownerStudentId() == null) {
            recipients.add(topic.proposerId());
        }
        publish(topicEvent(topic, approved ? "TOPIC_FINALIZED" : "TOPIC_REJECTED_BY_DEPARTMENT", department.fullName(),
                approved ? (topic.ownerStudentId() == null ? "Тэнхим багшийн дэвшүүлсэн сэдвийг баталж нээлттэй жагсаалт руу орууллаа." : "Тэнхим сэдвийг эцэслэн баталж удирдагч томиллоо.") : "Тэнхим сэдвийг буцаалаа.",
                approved ? (topic.ownerStudentId() == null ? "Сэдэв нээлттэй жагсаалт руу шилжлээ" : "Сэдэв эцэслэн батлагдлаа") : "Сэдэв тэнхим дээр буцаагдлаа",
                approved ? (topic.ownerStudentId() == null
                        ? "\"" + topic.title() + "\" сэдэв батлагдаж, оюутнуудын сонголтын жагсаалт руу орлоо."
                        : "\"" + topic.title() + "\" сэдэв батлагдаж, удирдагч багшаар " + advisor.fullName() + " томилогдлоо.")
                        : "\"" + topic.title() + "\" сэдвийг буцаалаа. Тайлбар: " + safeNote(note),
                recipients));
        return topic;
    }

    public Plan savePlan(Long studentId, Long topicId, List<WeeklyTask> tasks) {
        User student = getUser(studentId, UserRole.STUDENT);
        Topic topic = resolveApprovedTopicForPlan(student.id(), topicId);
        Plan plan = repository.findPlanByStudentId(studentId)
                .filter(existing -> existing.topicId().equals(topic.id()))
                .orElseGet(() -> new Plan(repository.nextPlanId(), topic.id(), topic.title(), student.id(), student.fullName(),
                        PlanStatus.DRAFT, tasks, List.of(), LocalDateTime.now(), LocalDateTime.now()));
        plan.updateTasks(tasks, LocalDateTime.now());
        plan = repository.savePlan(plan);
        publish(new WorkflowEvent("PLAN", plan.id(), "PLAN_SAVED", student.fullName(), "Оюутан 15 долоо хоногийн төлөвлөгөөг шинэчиллээ.",
                "Төлөвлөгөө draft хэлбэрээр хадгалагдлаа", student.fullName() + " 15 долоо хоногийн төлөвлөгөөг хадгаллаа.",
                List.of(student.id()), LocalDateTime.now()));
        return plan;
    }

    public Plan submitPlan(Long planId, Long studentId) {
        User student = getUser(studentId, UserRole.STUDENT);
        Plan plan = getPlan(planId);
        if (!plan.studentId().equals(student.id())) throw new IllegalStateException("Зөвхөн төлөвлөгөөний эзэмшигч submit хийнэ.");
        plan.submit(LocalDateTime.now());
        plan = repository.savePlan(plan);
        Topic topic = getTopic(plan.topicId());
        List<Long> recipients = new ArrayList<>();
        if (topic.advisorTeacherId() == null) {
            throw new IllegalStateException("Төлөвлөгөө илгээхийн өмнө сэдэв дээр удирдагч багш томилогдсон байх ёстой.");
        }
        recipients.add(topic.advisorTeacherId());
        publish(new WorkflowEvent("PLAN", plan.id(), "PLAN_SUBMITTED", student.fullName(), "Оюутан төлөвлөгөөг багшид илгээлээ.",
                "Шинэ төлөвлөгөө баталгаажуулалт хүлээж байна", student.fullName() + " \"" + plan.topicTitle() + "\" сэдвийн 15 долоо хоногийн төлөвлөгөөг илгээлээ.",
                recipients, LocalDateTime.now()));
        return plan;
    }

    public Plan teacherDecisionOnPlan(Long planId, Long teacherId, boolean approved, String note) {
        User teacher = getUser(teacherId, UserRole.TEACHER);
        Plan plan = getPlan(planId);
        Topic topic = getTopic(plan.topicId());
        if (topic.advisorTeacherId() == null || !topic.advisorTeacherId().equals(teacher.id())) {
            throw new IllegalStateException("Төлөвлөгөөг зөвхөн удирдагч багш батална.");
        }
        plan.teacherDecision(teacher, approved, note, LocalDateTime.now());
        plan = repository.savePlan(plan);
        publish(new WorkflowEvent("PLAN", plan.id(), approved ? "PLAN_APPROVED_BY_TEACHER" : "PLAN_REJECTED_BY_TEACHER", teacher.fullName(),
                approved ? "Багш төлөвлөгөөг тэнхим рүү дамжууллаа." : "Багш төлөвлөгөөг буцаалаа.",
                approved ? "Төлөвлөгөө тэнхимийн баталгаажуулалт руу шилжлээ" : "Төлөвлөгөө буцаагдлаа",
                approved ? "Төлөвлөгөө тэнхимийн шат руу шилжлээ." : "Төлөвлөгөө буцаагдлаа. Тайлбар: " + safeNote(note),
                approved ? userIdsByRole(UserRole.DEPARTMENT) : List.of(plan.studentId()), LocalDateTime.now()));
        return plan;
    }

    public Plan departmentDecisionOnPlan(Long planId, Long departmentId, boolean approved, String note) {
        User department = getUser(departmentId, UserRole.DEPARTMENT);
        Plan plan = getPlan(planId);
        plan.departmentDecision(department, approved, note, LocalDateTime.now());
        plan = repository.savePlan(plan);
        Topic topic = getTopic(plan.topicId());
        List<Long> recipients = new ArrayList<>();
        recipients.add(plan.studentId());
        if (topic.advisorTeacherId() != null) recipients.add(topic.advisorTeacherId());
        publish(new WorkflowEvent("PLAN", plan.id(), approved ? "PLAN_APPROVED" : "PLAN_REJECTED_BY_DEPARTMENT", department.fullName(),
                approved ? "Тэнхим төлөвлөгөөг баталлаа." : "Тэнхим төлөвлөгөөг буцаалаа.",
                approved ? "Төлөвлөгөө батлагдлаа" : "Төлөвлөгөө буцаагдлаа",
                approved ? "\"" + plan.topicTitle() + "\" сэдвийн төлөвлөгөө бүрэн батлагдлаа."
                        : "\"" + plan.topicTitle() + "\" сэдвийн төлөвлөгөө буцаагдлаа. Тайлбар: " + safeNote(note),
                recipients, LocalDateTime.now()));
        return plan;
    }

    public Review submitReview(Long planId, Long reviewerId, int week, int score, String comment) {
        User teacher = getUser(reviewerId, UserRole.TEACHER);
        Plan plan = getPlan(planId);
        if (plan.status() != PlanStatus.APPROVED) throw new IllegalStateException("Зөвхөн батлагдсан төлөвлөгөөн дээр review бүртгэнэ.");
        Review review = new Review(repository.nextReviewId(), planId, week, teacher.id(), teacher.fullName(), score, comment, LocalDateTime.now());
        repository.saveReview(review);
        publish(new WorkflowEvent("REVIEW", review.id(), "REVIEW_SUBMITTED", teacher.fullName(), "Багш долоо хоногийн review бүртгэл үүсгэлээ.",
                "Шинэ review нэмэгдлээ", teacher.fullName() + " " + week + "-р долоо хоногийн review орууллаа.",
                List.of(plan.studentId()), LocalDateTime.now()));
        return review;
    }

    private WorkflowEvent topicEvent(Topic topic, String action, String actorName, String detail,
                                     String notificationTitle, String notificationMessage, List<Long> recipientIds) {
        return new WorkflowEvent("TOPIC", topic.id(), action, actorName, detail, notificationTitle, notificationMessage, recipientIds, LocalDateTime.now());
    }

    private void publish(WorkflowEvent event) { eventPublisher.publish(event); }
    private User getUser(Long userId, UserRole role) {
        Long resolvedUserId = normalizeUserId(userId, role);
        User user = repository.findUserById(resolvedUserId).orElseThrow(() -> new IllegalArgumentException("Хэрэглэгч олдсонгүй."));
        if (user.role() != role) throw new IllegalArgumentException("Хэрэглэгчийн role тохирохгүй байна.");
        return user;
    }
    private Topic getTopic(Long topicId) { return repository.findTopicById(topicId).orElseThrow(() -> new IllegalArgumentException("Сэдэв олдсонгүй.")); }
    private Plan getPlan(Long planId) { return repository.findPlanById(planId).orElseThrow(() -> new IllegalArgumentException("Төлөвлөгөө олдсонгүй.")); }
    private List<Long> userIdsByRole(UserRole role) { return repository.findUsersByRole(role).stream().map(User::id).toList(); }
    private String safeNote(String note) { return note == null || note.isBlank() ? "Тайлбар өгөөгүй" : note; }

    private Topic resolveApprovedTopicForPlan(Long studentId, Long requestedTopicId) {
        if (requestedTopicId != null) {
            Topic requestedTopic = getTopic(requestedTopicId);
            if (requestedTopic.status() == TopicStatus.APPROVED && studentId.equals(requestedTopic.ownerStudentId())) {
                return requestedTopic;
            }
        }
        return repository.findAllTopics().stream()
                .filter(topic -> topic.status() == TopicStatus.APPROVED)
                .filter(topic -> studentId.equals(topic.ownerStudentId()))
                .sorted((left, right) -> right.updatedAt().compareTo(left.updatedAt()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Энэ оюутан батлагдсан өөрийн сэдэв дээр л төлөвлөгөө үүсгэнэ."));
    }

    private void supersedePreviousTopics(Topic approvedTopic) {
        Long studentId = approvedTopic.ownerStudentId();
        if (studentId == null) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        repository.findAllTopics().stream()
                .filter(topic -> !topic.id().equals(approvedTopic.id()))
                .filter(topic -> studentId.equals(topic.ownerStudentId()))
                .filter(topic -> topic.status() == TopicStatus.APPROVED
                        || topic.status() == TopicStatus.PENDING_TEACHER_APPROVAL
                        || topic.status() == TopicStatus.PENDING_DEPARTMENT_APPROVAL)
                .forEach(topic -> {
                    topic.supersede(now);
                    repository.saveTopic(topic);
                });
    }

    private Long normalizeUserId(Long userId, UserRole role) {
        if (userId == null) {
            throw new IllegalArgumentException("Хэрэглэгчийн id дамжуулаагүй байна.");
        }
        long offset = switch (role) {
            case STUDENT -> STUDENT_OFFSET;
            case TEACHER -> TEACHER_OFFSET;
            case DEPARTMENT -> DEPARTMENT_OFFSET;
        };
        return userId >= offset ? userId : offset + userId;
    }
}
