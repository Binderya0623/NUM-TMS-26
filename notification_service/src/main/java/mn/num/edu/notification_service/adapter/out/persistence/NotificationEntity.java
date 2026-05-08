package mn.num.edu.notification_service.adapter.out.persistence;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("notifications")
public class NotificationEntity implements Persistable<UUID> {
    @Id
    private UUID id;
    private UUID userId;
    private String title;
    private String message;
    private String type;
    private String channel;
    private String status;
    private String thesisId;
    private String referenceId;
    private String referenceType;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;

    @Transient
    private boolean isNew;

    public NotificationEntity() {}

    /** Used by Spring Data when loading rows. */
    public NotificationEntity(UUID id, UUID userId, String title, String message, String type,
                              String channel, String status, String thesisId, String referenceId,
                              String referenceType, Boolean isRead,
                              LocalDateTime createdAt, LocalDateTime sentAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.channel = channel;
        this.status = status;
        this.thesisId = thesisId;
        this.referenceId = referenceId;
        this.referenceType = referenceType;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.sentAt = sentAt;
        this.isNew = false;
    }

    /** Use this when creating a new row to flag it as INSERT. */
    public static NotificationEntity newRow(UUID id, UUID userId, String title, String message,
                                            String type, String thesisId, String referenceId,
                                            String referenceType) {
        NotificationEntity e = new NotificationEntity(
                id, userId, title, message, type,
                null, "PENDING", thesisId, referenceId, referenceType, false,
                LocalDateTime.now(), null
        );
        e.isNew = true;
        return e;
    }

    public NotificationEntity markPersisted() { this.isNew = false; return this; }

    @Override public UUID getId() { return id; }
    @Override public boolean isNew() { return isNew; }
    public void setNew(boolean isNew) { this.isNew = isNew; }

    public UUID getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getType() { return type; }
    public String getChannel() { return channel; }
    public String getStatus() { return status; }
    public String getThesisId() { return thesisId; }
    public String getReferenceId() { return referenceId; }
    public String getReferenceType() { return referenceType; }
    public Boolean getIsRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getSentAt() { return sentAt; }

    public void setStatus(String status) { this.status = status; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
}
