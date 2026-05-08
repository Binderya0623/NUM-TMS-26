package mn.num.edu.notification_service.adapter.out.persistence;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface NotificationR2dbcRepository extends ReactiveCrudRepository<NotificationEntity, UUID> {

    Flux<NotificationEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Flux<NotificationEntity> findByUserIdAndIsReadOrderByCreatedAtDesc(UUID userId, Boolean isRead);

    @Query("SELECT COUNT(*) FROM notifications WHERE user_id = :userId AND is_read = FALSE")
    Mono<Long> countUnreadByUserId(UUID userId);

    /** Convenience for old call sites — same as ordered descending. */
    default Flux<NotificationEntity> findByUserId(UUID userId) {
        return findByUserIdOrderByCreatedAtDesc(userId);
    }
}
