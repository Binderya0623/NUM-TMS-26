package mn.num.edu.thesis_service.adapter.out.persistence;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("chat_message")
public class ChatMessageEntity implements Persistable<String> {

    @Id
    private String id;
    private String thesisId;
    private String senderId;
    private String senderRole;
    private String content;
    private String attachmentPath;
    private String attachmentName;
    private Long attachmentSize;
    private Boolean isRead;
    private LocalDateTime sentAt;

    @Transient
    private boolean isNew;

    public ChatMessageEntity() {}

    @Override public String getId() { return id; }
    @Override public boolean isNew() { return isNew; }

    public void setId(String id) { this.id = id; }
    public void setNew(boolean n) { this.isNew = n; }
    public String getThesisId() { return thesisId; }
    public void setThesisId(String thesisId) { this.thesisId = thesisId; }
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAttachmentPath() { return attachmentPath; }
    public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }
    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }
    public Long getAttachmentSize() { return attachmentSize; }
    public void setAttachmentSize(Long attachmentSize) { this.attachmentSize = attachmentSize; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
