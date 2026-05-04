package mn.num.edu.message_service.adapter.out.persistence;

import lombok.*;
import mn.num.edu.message_service.domain.model.MessageStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table("messages")
public class MessageEntity implements Persistable<String> {

    @Id
    private String id;

    private String conversationId;

    private String senderId;

    private String receiverId;

    private String content;

    private MessageStatus status;

    private Instant createdAt;

    private Instant seenAt;
    @Transient
    @Builder.Default
    private boolean isNew = true;
    @Override
    public String getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    public void markNotNew() {
        this.isNew = false;
    }
}