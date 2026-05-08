package mn.num.edu.notification_service.adapter.out.persistence;

import mn.num.edu.notification_service.application.port.out.LoadNotificationPort;
import mn.num.edu.notification_service.application.port.out.SaveNotificationPort;
import mn.num.edu.notification_service.domain.model.Notification;
import mn.num.edu.notification_service.domain.model.NotificationStatus;
import mn.num.edu.notification_service.domain.model.NotificationType;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class NotificationPersistenceAdapter implements SaveNotificationPort, LoadNotificationPort {

    private final NotificationR2dbcRepository repository;

    public NotificationPersistenceAdapter(NotificationR2dbcRepository repository) {
        this.repository = repository;
    }

    @Override
    public Mono<Notification> save(Notification notification) {
        NotificationEntity e = toEntity(notification);
        e.setNew(true);
        return repository.save(e).map(this::toDomain);
    }

    @Override
    public Mono<Notification> update(Notification notification) {
        NotificationEntity e = toEntity(notification);
        e.setNew(false);
        return repository.save(e).map(this::toDomain);
    }

    @Override
    public Mono<Notification> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Flux<Notification> findByUserId(UUID userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).map(this::toDomain);
    }

    @Override
    public Flux<Notification> findUnreadByUserId(UUID userId) {
        return repository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false).map(this::toDomain);
    }

    @Override
    public Mono<Long> countUnreadByUserId(UUID userId) {
        return repository.countUnreadByUserId(userId).defaultIfEmpty(0L);
    }

    private NotificationEntity toEntity(Notification n) {
        return new NotificationEntity(
                n.getId(),
                n.getUserId(),
                n.getTitle(),
                n.getMessage(),
                n.getType().name(),
                null,
                n.getStatus().name(),
                n.getThesisId(),
                n.getReferenceId(),
                n.getReferenceType(),
                n.isRead(),
                n.getCreatedAt(),
                n.getSentAt()
        );
    }

    private Notification toDomain(NotificationEntity e) {
        return new Notification(
                e.getId(),
                e.getUserId(),
                e.getTitle(),
                e.getMessage(),
                NotificationType.valueOf(e.getType()),
                NotificationStatus.valueOf(e.getStatus()),
                e.getThesisId(),
                e.getReferenceId(),
                e.getReferenceType(),
                Boolean.TRUE.equals(e.getIsRead()),
                e.getCreatedAt(),
                e.getSentAt()
        );
    }
}
