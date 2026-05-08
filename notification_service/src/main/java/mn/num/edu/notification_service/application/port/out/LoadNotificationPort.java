package mn.num.edu.notification_service.application.port.out;

import mn.num.edu.notification_service.domain.model.Notification;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface LoadNotificationPort {
    Flux<Notification> findByUserId(UUID userId);
    Flux<Notification> findUnreadByUserId(UUID userId);
    Mono<Long> countUnreadByUserId(UUID userId);
}