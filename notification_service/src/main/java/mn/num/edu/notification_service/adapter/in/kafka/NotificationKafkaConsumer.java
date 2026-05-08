package mn.num.edu.notification_service.adapter.in.kafka;

import mn.num.edu.notification_service.application.port.in.CreateNotificationUseCase;
import mn.num.edu.notification_service.domain.event.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Map;

/**
 * Every listener takes a {@code Map<String, Object>} and projects fields into
 * our local event records. Cross-service producers don't share Java classes
 * with us — typed deserialization breaks because they don't emit the
 * {@code __TypeId__} header. The Map approach is producer-agnostic.
 *
 * Listener bodies catch and log handler errors so a single bad record can't
 * tear the listener container down.
 */
@Component
public class NotificationKafkaConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationKafkaConsumer.class);

    private final CreateNotificationUseCase createNotificationUseCase;

    public NotificationKafkaConsumer(CreateNotificationUseCase createNotificationUseCase) {
        this.createNotificationUseCase = createNotificationUseCase;
    }

    @KafkaListener(topics = "thesis-approved", groupId = "notification-service-group")
    public void consumeThesisApproved(Map<String, Object> raw) {
        log.info("[notif] thesis-approved <- {}", raw);
        ThesisApprovedEvent event = new ThesisApprovedEvent(
                str(raw.get("thesisId")),
                str(raw.get("studentId")),
                str(raw.get("thesisTitle")),
                parseLocalDateTime(raw.getOrDefault("occurredAt", raw.get("approvedAt")))
        );
        safeRun(createNotificationUseCase.handleThesisApproved(event), "handleThesisApproved");
    }

    /**
     * Direct {@code committee-assigned} (kept for callers that already use
     * this name) plus the two granular topics committee_service actually
     * publishes today: {@code committee-teacher-assigned} and
     * {@code committee-student-assigned}.
     */
    @KafkaListener(topics = {"committee-assigned", "committee-teacher-assigned", "committee-student-assigned"},
                   groupId = "notification-service-group")
    public void consumeCommitteeAssigned(Map<String, Object> raw) {
        log.info("[notif] committee-assigned <- {}", raw);
        CommitteeAssignedEvent event = new CommitteeAssignedEvent(
                str(raw.get("committeeId")),
                str(raw.get("teacherId")),
                str(raw.get("studentId")),
                str(raw.get("departmentId")),
                str(raw.get("committeeName")),
                str(raw.get("role")),
                Instant.now()
        );
        safeRun(createNotificationUseCase.handleCommitteeAssigned(event), "handleCommitteeAssigned");
    }

    @KafkaListener(topics = "report-submitted", groupId = "notification-service-group")
    public void consumeReportSubmitted(Map<String, Object> raw) {
        log.info("[notif] report-submitted <- {}", raw);
        ReportSubmittedEvent event = new ReportSubmittedEvent(
                str(raw.get("reportId")),
                str(raw.get("studentId")),
                str(raw.get("reportType")),
                parseLocalDateTime(raw.get("submittedAt"))
        );
        safeRun(createNotificationUseCase.handleReportSubmitted(event), "handleReportSubmitted");
    }

    /** Both spellings — see comment on the topic config. */
    @KafkaListener(topics = {"evaluation-completed", "evaluation.completed"},
                   groupId = "notification-service-group")
    public void consumeEvaluationCompleted(Map<String, Object> raw) {
        log.info("[notif] evaluation-completed <- {}", raw);
        EvaluationCompletedEvent event = new EvaluationCompletedEvent(
                str(raw.get("evaluationId")),
                str(raw.get("thesisId")),
                str(raw.get("studentId")),
                str(raw.get("workflowId")),
                str(raw.get("stageId")),
                str(raw.get("stageName")),
                doubleVal(raw.get("totalScore")),
                parseLocalDateTime(raw.getOrDefault("occurredAt", raw.get("completedAt")))
        );
        safeRun(createNotificationUseCase.handleEvaluationCompleted(event), "handleEvaluationCompleted");
    }

    @KafkaListener(topics = "final-grade-calculated", groupId = "notification-service-group")
    public void consumeFinalGradeCalculated(Map<String, Object> raw) {
        log.info("[notif] final-grade-calculated <- {}", raw);
        FinalGradeCalculatedEvent event = new FinalGradeCalculatedEvent(
                str(raw.get("thesisId")),
                str(raw.get("studentId")),
                str(raw.get("workflowId")),
                doubleVal(raw.get("totalScore")),
                str(raw.get("status")),
                parseLocalDateTime(raw.getOrDefault("occurredAt", raw.get("calculatedAt")))
        );
        safeRun(createNotificationUseCase.handleFinalGradeCalculated(event), "handleFinalGradeCalculated");
    }

    @KafkaListener(topics = "workflow-deadline-set", groupId = "notification-service-group")
    public void consumeWorkflowDeadlineSet(Map<String, Object> raw) {
        log.info("[notif] workflow-deadline-set <- {}", raw);
        WorkflowDeadlineSetEvent event = new WorkflowDeadlineSetEvent(
                str(raw.get("workflowId")),
                str(raw.get("thesisId")),
                str(raw.get("studentId")),
                str(raw.get("stageName")),
                parseLocalDateTime(raw.get("deadline"))
        );
        safeRun(createNotificationUseCase.handleWorkflowDeadlineSet(event), "handleWorkflowDeadlineSet");
    }

    /** Subscribe and swallow handler errors — keeps the container alive. */
    private void safeRun(Mono<Void> work, String label) {
        try {
            work.doOnError(e -> log.warn("{} failed: {}", label, e.getMessage()))
                .onErrorResume(e -> Mono.empty())
                .subscribe();
        } catch (Exception ex) {
            log.warn("{} threw synchronously: {}", label, ex.getMessage());
        }
    }

    private static String str(Object v) { return v == null ? null : v.toString(); }

    private static Double doubleVal(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(v.toString()); } catch (NumberFormatException ex) { return null; }
    }

    private static LocalDateTime parseLocalDateTime(Object v) {
        if (v == null) return null;
        try { return LocalDateTime.parse(v.toString()); }
        catch (DateTimeParseException ex) { return null; }
    }
}
