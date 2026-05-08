package mn.num.edu.notification_service.application.service;

import mn.num.edu.notification_service.application.port.in.CreateNotificationUseCase;
import mn.num.edu.notification_service.application.port.out.PublishNotificationEventPort;
import mn.num.edu.notification_service.application.port.out.SaveNotificationPort;
import mn.num.edu.notification_service.domain.event.*;
import mn.num.edu.notification_service.domain.model.Notification;
import mn.num.edu.notification_service.domain.model.NotificationStatus;
import mn.num.edu.notification_service.domain.model.NotificationType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class NotificationApplicationService implements CreateNotificationUseCase {

    private static final Logger log = LoggerFactory.getLogger(NotificationApplicationService.class);

    private final SaveNotificationPort saveNotificationPort;
    private final PublishNotificationEventPort publishNotificationEventPort;

    public NotificationApplicationService(SaveNotificationPort saveNotificationPort,
                                          PublishNotificationEventPort publishNotificationEventPort) {
        this.saveNotificationPort = saveNotificationPort;
        this.publishNotificationEventPort = publishNotificationEventPort;
    }

    @Override
    public Mono<Void> handleThesisApproved(ThesisApprovedEvent event) {
        Notification notification = new Notification(
                UUID.randomUUID(),
                toUserId(event.studentId()),
                "Дипломын ажил батлагдлаа",
                "Таны \"" + event.thesisTitle() + "\" сэдэв батлагдлаа.",
                NotificationType.THESIS_APPROVED,
                NotificationStatus.PENDING,
                LocalDateTime.now(),
                null
        );

        return saveAndPublish(notification);
    }

    @Override
    public Mono<Void> handleCommitteeAssigned(CommitteeAssignedEvent event) {
        String recipientId = event.teacherId() != null ? event.teacherId() : event.studentId();
        Notification notification = new Notification(
                UUID.randomUUID(),
                toUserId(recipientId),
                "Комисст томилогдлоо",
                "Та \"" + valueOrDefault(event.committeeName(), event.committeeId()) + "\" комисст "
                        + valueOrDefault(event.role(), "гишүүн") + " үүрэгтэй томилогдлоо.",
                NotificationType.COMMITTEE_ASSIGNED,
                NotificationStatus.PENDING,
                LocalDateTime.now(),
                null
        );

        return saveAndPublish(notification);
    }

    @Override
    public Mono<Void> handleReportSubmitted(ReportSubmittedEvent event) {
        Notification notification = new Notification(
                UUID.randomUUID(),
                toUserId(event.studentId()),
                "Тайлан амжилттай илгээгдлээ",
                "Таны " + event.reportType() + " тайлан амжилттай бүртгэгдлээ.",
                NotificationType.REPORT_SUBMITTED,
                NotificationStatus.PENDING,
                LocalDateTime.now(),
                null
        );

        return saveAndPublish(notification);
    }

    @Override
    public Mono<Void> handleEvaluationCompleted(EvaluationCompletedEvent event) {
        Notification notification = new Notification(
                UUID.randomUUID(),
                toUserId(event.studentId()),
                "Үнэлгээ дууслаа",
                valueOrDefault(event.stageName(), event.stageId()) + " шатны үнэлгээ дууслаа. Нийт оноо: " + event.totalScore(),
                NotificationType.EVALUATION_COMPLETED,
                NotificationStatus.PENDING,
                LocalDateTime.now(),
                null
        );

        return saveAndPublish(notification);
    }

    @Override
    public Mono<Void> handleFinalGradeCalculated(FinalGradeCalculatedEvent event) {
        Notification notification = new Notification(
                UUID.randomUUID(),
                toUserId(event.studentId()),
                "Эцсийн дүн бодогдлоо",
                "Таны эцсийн үнэлгээ: " + event.totalScore() + " (" + event.status() + ")",
                NotificationType.FINAL_GRADE_CALCULATED,
                NotificationStatus.PENDING,
                LocalDateTime.now(),
                null
        );

        return saveAndPublish(notification);
    }

    @Override
    public Mono<Void> handleWorkflowDeadlineSet(WorkflowDeadlineSetEvent event) {
        Notification notification = new Notification(
                UUID.randomUUID(),
                toUserId(event.studentId()),
                "Шатны deadline тохируулагдлаа",
                event.stageName() + " шатны deadline: " + event.deadline(),
                NotificationType.WORKFLOW_DEADLINE_SET,
                NotificationStatus.PENDING,
                LocalDateTime.now(),
                null
        );

        return saveAndPublish(notification);
    }

    private Mono<Void> saveAndPublish(Notification notification) {
        return saveNotificationPort.save(notification)
                .flatMap(saved -> {
                    saved.markSent();
                    return saveNotificationPort.update(saved)
                            .then(publishNotificationEventPort.publishSent(
                                    new NotificationSentEvent(
                                            saved.getId(),
                                            saved.getUserId(),
                                            saved.getTitle(),
                                            saved.getSentAt()
                                    )
                            ));
                })
                .doOnSuccess(v -> log.info("Notification processed successfully: {}", notification.getTitle()))
                .onErrorResume(ex -> {
                    log.error("Failed to process notification: {}", ex.getMessage(), ex);
                    return publishNotificationEventPort.publishFailed(
                            new NotificationFailedEvent(
                                    notification.getId(),
                                    notification.getUserId(),
                                    ex.getMessage(),
                                    LocalDateTime.now()
                            )
                    );
                });
    }

    /**
     * Coerce an upstream "user id" to a UUID for the {@code notifications.user_id}
     * column.
     * <ul>
     *   <li>If it's already a valid UUID string, parse it directly (this is the
     *       happy path for events that carry user_service UUIDs).</li>
     *   <li>If it's something else (sisiId like {@code 22b1num0027}, numeric id,
     *       arbitrary string), derive a deterministic UUID via {@code UUID.nameUUIDFromBytes}
     *       so the row can still be inserted. The frontend keys notifications by
     *       the user's UUID from auth-service, so these "derived" rows won't be
     *       visible to the user — but the consumer no longer crashes and the
     *       record exists for backfill once the upstream producer is corrected.</li>
     *   <li>If null/blank, return a fallback UUID and log a warning. Caller should
     *       avoid this path.</li>
     * </ul>
     */
    private UUID toUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            log.warn("toUserId called with null/blank — using zero UUID");
            return new UUID(0L, 0L);
        }
        try {
            return UUID.fromString(userId);
        } catch (IllegalArgumentException ex) {
            log.warn("toUserId got non-UUID '{}' — deriving deterministic UUID. " +
                    "Notification will not surface in the user's inbox until the producer " +
                    "emits the user_service UUID.", userId);
            return UUID.nameUUIDFromBytes(userId.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    private String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
