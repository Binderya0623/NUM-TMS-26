package mn.num.edu.notification_service.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class Notification {
    private UUID id;
    private UUID userId;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationStatus status;
    private String thesisId;
    private String referenceId;
    private String referenceType;
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;

    public Notification() {}

    public Notification(UUID id, UUID userId, String title, String message, NotificationType type,
                        NotificationStatus status, LocalDateTime createdAt, LocalDateTime sentAt) {
        this(id, userId, title, message, type, status, null, null, null, false, createdAt, sentAt);
    }

    public Notification(UUID id, UUID userId, String title, String message, NotificationType type,
                        NotificationStatus status,
                        String thesisId, String referenceId, String referenceType, boolean isRead,
                        LocalDateTime createdAt, LocalDateTime sentAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.status = status;
        this.thesisId = thesisId;
        this.referenceId = referenceId;
        this.referenceType = referenceType;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.sentAt = sentAt;
    }

    public void markSent() {
        this.status = NotificationStatus.SENT;
        this.sentAt = LocalDateTime.now();
    }

    public void markFailed() { this.status = NotificationStatus.FAILED; }

    public void markRead() {
        this.isRead = true;
        this.status = NotificationStatus.READ;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public NotificationType getType() { return type; }
    public NotificationStatus getStatus() { return status; }
    public String getThesisId() { return thesisId; }
    public String getReferenceId() { return referenceId; }
    public String getReferenceType() { return referenceType; }
    public boolean isRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getSentAt() { return sentAt; }
}
