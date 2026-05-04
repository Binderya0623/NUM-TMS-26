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
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;

    public Notification() {
    }

    public Notification(UUID id, UUID userId, String title, String message, NotificationType type,
                        NotificationStatus status, LocalDateTime createdAt, LocalDateTime sentAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.status = status;
        this.createdAt = createdAt;
        this.sentAt = sentAt;
    }

    public void markSent() {
        this.status = NotificationStatus.SENT;
        this.sentAt = LocalDateTime.now();
    }

    public void markFailed() {
        this.status = NotificationStatus.FAILED;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public NotificationType getType() {
        return type;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }
}
