package mn.num.edu.notification_service.adapter.out.persistence;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface NotificationR2dbcRepository extends ReactiveCrudRepository<NotificationEntity, UUID> {
    Flux<NotificationEntity> findByUserId(UUID userId);
}