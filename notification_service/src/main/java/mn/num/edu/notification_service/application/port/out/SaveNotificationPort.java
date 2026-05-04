package mn.num.edu.notification_service.application.port.out;

import mn.num.edu.notification_service.domain.model.Notification;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface SaveNotificationPort {
    Mono<Notification> save(Notification notification);
    Mono<Notification> update(Notification notification);
    Mono<Notification> findById(UUID id);
}