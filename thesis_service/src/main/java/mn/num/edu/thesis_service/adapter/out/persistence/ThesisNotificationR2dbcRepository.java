package mn.num.edu.thesis_service.adapter.out.persistence;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface ThesisNotificationR2dbcRepository extends ReactiveCrudRepository<ThesisNotificationEntity, String> {

    @Query("SELECT * FROM thesis_notification WHERE recipient_id = :recipientId ORDER BY created_at DESC")
    Flux<ThesisNotificationEntity> findByRecipientId(String recipientId);

    @Query("SELECT * FROM thesis_notification WHERE recipient_id = :recipientId AND is_read = FALSE ORDER BY created_at DESC")
    Flux<ThesisNotificationEntity> findUnreadByRecipientId(String recipientId);
}
