package mn.num.edu.message_service.adapter.out.persistence;

import mn.num.edu.message_service.domain.model.MessageStatus;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface MessageR2dbcRepository
        extends ReactiveCrudRepository<MessageEntity, String> {

    Flux<MessageEntity> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    Flux<MessageEntity> findByConversationIdAndReceiverIdAndStatus(
            String conversationId,
            String receiverId,
            MessageStatus status
    );
    @Query("""
        UPDATE messages
        SET status = 'SEEN',
            seen_at = NOW()
        WHERE conversation_id = :conversationId
        AND receiver_id = :receiverId
        AND status = 'SENT'
        """)
    Flux<Void> markMessagesAsSeen(String conversationId, String receiverId);
}