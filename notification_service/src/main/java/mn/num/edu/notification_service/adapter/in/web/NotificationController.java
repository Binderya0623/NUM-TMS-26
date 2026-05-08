package mn.num.edu.notification_service.adapter.in.web;

import mn.num.edu.notification_service.application.port.out.LoadNotificationPort;
import mn.num.edu.notification_service.application.port.out.SaveNotificationPort;
import mn.num.edu.notification_service.domain.model.Notification;
import mn.num.edu.notification_service.domain.model.NotificationStatus;
import mn.num.edu.notification_service.domain.model.NotificationType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Single canonical notification API. Backed by the {@code notifications} table.
 *
 * Other services should either:
 *   1. publish a Kafka event and let {@code NotificationKafkaConsumer} create
 *      the notification, OR
 *   2. POST directly to /api/notifications when a synchronous create is more
 *      appropriate (e.g. inline with a user-facing action).
 *
 * The legacy {@code /api/thesis-notifications} endpoint in thesis_service has
 * been removed; both lived in the same conceptual space and the duplication
 * caused inconsistencies.
 */
@Tag(name = "Notification API")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final LoadNotificationPort loadPort;
    private final SaveNotificationPort savePort;

    public NotificationController(LoadNotificationPort loadPort, SaveNotificationPort savePort) {
        this.loadPort = loadPort;
        this.savePort = savePort;
    }

    /**
     * GET /api/notifications/user/{userId}[?unreadOnly=true]
     * Lists this user's notifications, newest first.
     */
    @Operation(summary = "Get notifications by userId")
    @GetMapping("/user/{userId}")
    public Flux<Notification> getByUserId(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "false") boolean unreadOnly
    ) {
        return unreadOnly ? loadPort.findUnreadByUserId(userId) : loadPort.findByUserId(userId);
    }

    /**
     * GET /api/notifications/user/{userId}/unread-count
     * Drives the bell badge on the layout's TopHeader.
     */
    @GetMapping("/user/{userId}/unread-count")
    public Mono<Map<String, Long>> unreadCount(@PathVariable UUID userId) {
        return loadPort.countUnreadByUserId(userId).map(c -> Map.of("count", c));
    }

    /**
     * POST /api/notifications
     * Direct creation entry point. Used when a service wants a notification
     * persisted synchronously (e.g. attached to the same response). Async
     * Kafka-driven creates still land in the same table.
     */
    @Operation(summary = "Create a notification")
    @PostMapping
    public Mono<ResponseEntity<Notification>> create(@RequestBody CreateNotificationRequest req) {
        if (req.userId() == null || req.userId().isBlank()) {
            return Mono.just(ResponseEntity.badRequest().build());
        }
        UUID userId;
        try {
            userId = UUID.fromString(req.userId());
        } catch (IllegalArgumentException ex) {
            return Mono.just(ResponseEntity.badRequest().build());
        }

        NotificationType type;
        try {
            type = NotificationType.valueOf(req.type() == null ? "GENERIC" : req.type());
        } catch (IllegalArgumentException ex) {
            type = NotificationType.GENERIC;
        }

        Notification n = new Notification(
                UUID.randomUUID(),
                userId,
                req.title(),
                req.message() == null ? "" : req.message(),
                type,
                NotificationStatus.SENT,
                req.thesisId(),
                req.referenceId(),
                req.referenceType(),
                false,
                LocalDateTime.now(),
                LocalDateTime.now()
        );
        return savePort.save(n)
                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
    }

    /**
     * PATCH /api/notifications/{id}/read — flip a single row to read.
     */
    @PatchMapping("/{id}/read")
    public Mono<ResponseEntity<Notification>> markRead(@PathVariable UUID id) {
        return savePort.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Notification not found")))
                .flatMap(n -> {
                    n.markRead();
                    return savePort.update(n);
                })
                .map(ResponseEntity::ok);
    }

    /**
     * PATCH /api/notifications/user/{userId}/read-all — mass mark-read.
     */
    @PatchMapping("/user/{userId}/read-all")
    public Mono<ResponseEntity<Void>> markAllRead(@PathVariable UUID userId) {
        return loadPort.findUnreadByUserId(userId)
                .flatMap(n -> {
                    n.markRead();
                    return savePort.update(n);
                })
                .then(Mono.just(ResponseEntity.noContent().<Void>build()));
    }

    public record CreateNotificationRequest(
            String userId,
            String title,
            String message,
            String type,
            String thesisId,
            String referenceId,
            String referenceType
    ) {}
}
