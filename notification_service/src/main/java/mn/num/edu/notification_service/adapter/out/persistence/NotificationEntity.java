package mn.num.edu.notification_service.adapter.out.persistence;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("notifications")
public class NotificationEntity {
    @Id
    private UUID id;
    private UUID userId;
    private String title;
    private String message;
    private String type;
    private String channel;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;

    public NotificationEntity() {
    }

    public NotificationEntity(UUID id, UUID userId, String title, String message, String type,
                              String channel, String status, LocalDateTime createdAt, LocalDateTime sentAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.channel = channel;
        this.status = status;
        this.createdAt = createdAt;
        this.sentAt = sentAt;
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

    public String getType() {
        return type;
    }

    public String getChannel() {
        return channel;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }
}
