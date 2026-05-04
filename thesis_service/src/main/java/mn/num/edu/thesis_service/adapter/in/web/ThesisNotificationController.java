package mn.num.edu.thesis_service.adapter.in.web;

import mn.num.edu.thesis_service.adapter.out.persistence.ThesisNotificationEntity;
import mn.num.edu.thesis_service.adapter.out.persistence.ThesisNotificationR2dbcRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/thesis-notifications")
public class ThesisNotificationController {

    private final ThesisNotificationR2dbcRepository repository;

    public ThesisNotificationController(ThesisNotificationR2dbcRepository repository) {
        this.repository = repository;
    }

    /** GET /api/thesis-notifications?recipientId=xxx&unreadOnly=true */
    @GetMapping
    public Flux<ThesisNotificationEntity> list(
            @RequestParam String recipientId,
            @RequestParam(defaultValue = "false") boolean unreadOnly
    ) {
        if (unreadOnly) return repository.findUnreadByRecipientId(recipientId);
        return repository.findByRecipientId(recipientId);
    }

    /** POST /api/thesis-notifications — create a notification (internal/service use) */
    @PostMapping
    public Mono<ResponseEntity<ThesisNotificationEntity>> create(@RequestBody CreateNotificationRequest req) {
        ThesisNotificationEntity entity = new ThesisNotificationEntity();
        entity.setId(UUID.randomUUID().toString());
        entity.setNew(true);
        entity.setRecipientId(req.recipientId());
        entity.setThesisId(req.thesisId());
        entity.setType(req.type());
        entity.setTitle(req.title());
        entity.setMessage(req.message());
        entity.setReferenceId(req.referenceId());
        entity.setReferenceType(req.referenceType());
        entity.setIsRead(false);
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity)
                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
    }

    /** PATCH /api/thesis-notifications/{id}/read */
    @PatchMapping("/{id}/read")
    public Mono<ResponseEntity<ThesisNotificationEntity>> markRead(@PathVariable String id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Notification not found")))
                .flatMap(n -> {
                    n.setIsRead(true);
                    n.setNew(false);
                    return repository.save(n);
                })
                .map(ResponseEntity::ok);
    }

    /** PATCH /api/thesis-notifications/mark-all-read?recipientId=xxx */
    @PatchMapping("/mark-all-read")
    public Mono<ResponseEntity<Void>> markAllRead(@RequestParam String recipientId) {
        return repository.findUnreadByRecipientId(recipientId)
                .flatMap(n -> {
                    n.setIsRead(true);
                    n.setNew(false);
                    return repository.save(n);
                })
                .then(Mono.just(ResponseEntity.noContent().<Void>build()));
    }

    public record CreateNotificationRequest(
            String recipientId, String thesisId, String type,
            String title, String message, String referenceId, String referenceType
    ) {}
}
