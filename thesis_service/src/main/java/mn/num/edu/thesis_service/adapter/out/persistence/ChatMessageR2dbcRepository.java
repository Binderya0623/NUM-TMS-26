package mn.num.edu.thesis_service.adapter.out.persistence;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;

@Repository
public interface ChatMessageR2dbcRepository extends ReactiveCrudRepository<ChatMessageEntity, String> {

    @Query("SELECT * FROM chat_message WHERE thesis_id = :thesisId ORDER BY sent_at DESC")
    Flux<ChatMessageEntity> findByThesisId(String thesisId);

    @Query("SELECT * FROM chat_message WHERE thesis_id = :thesisId AND sent_at > :since ORDER BY sent_at ASC")
    Flux<ChatMessageEntity> findByThesisIdAndSentAtAfter(String thesisId, LocalDateTime since);

    @Query("SELECT * FROM chat_message WHERE thesis_id = :thesisId AND is_read = FALSE AND sender_id != :readerId")
    Flux<ChatMessageEntity> findUnreadByThesisId(String thesisId, String readerId);
}
