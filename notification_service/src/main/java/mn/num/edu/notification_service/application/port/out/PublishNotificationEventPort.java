package mn.num.edu.notification_service.application.port.out;

import mn.num.edu.notification_service.domain.event.NotificationFailedEvent;
import mn.num.edu.notification_service.domain.event.NotificationSentEvent;
import reactor.core.publisher.Mono;

public interface PublishNotificationEventPort {
    Mono<Void> publishSent(NotificationSentEvent event);
    Mono<Void> publishFailed(NotificationFailedEvent event);
}