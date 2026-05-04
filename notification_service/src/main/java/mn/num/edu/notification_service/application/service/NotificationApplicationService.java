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

    private UUID toUserId(String userId) {
        return UUID.fromString(userId);
    }

    private String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
