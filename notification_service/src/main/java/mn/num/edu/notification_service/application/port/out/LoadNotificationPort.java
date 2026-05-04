package mn.num.edu.notification_service.application.port.out;

import mn.num.edu.notification_service.domain.model.Notification;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface LoadNotificationPort {
    Flux<Notification> findByUserId(UUID userId);
}