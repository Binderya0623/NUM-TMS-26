package mn.num.edu.workflow_service.adapters.in.web;

import mn.num.edu.workflow_service.adapters.out.persistence.entity.DefenseSessionEntity;
import mn.num.edu.workflow_service.adapters.out.persistence.repository.DefenseSessionR2dbcRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/defense-sessions")
public class DefenseSessionController {

    private static final Logger log = LoggerFactory.getLogger(DefenseSessionController.class);
    /** notification_service listens here. Fanout for committee/global sessions
     *  is a follow-up (see {@link #publishDeadlineIfApplicable(DefenseSessionEntity)}). */
    private static final String DEADLINE_TOPIC = "workflow-deadline-set";

    private final DefenseSessionR2dbcRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public DefenseSessionController(DefenseSessionR2dbcRepository repository,
                                     KafkaTemplate<String, Object> kafkaTemplate) {
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
    }

    // Canonical DB stage names + frontend aliases
    private static final Map<String, BigDecimal> STAGE_MAX_POINTS = Map.of(
            "PROGRESS_1",    BigDecimal.valueOf(15),
            "PROGRESS_2",    BigDecimal.valueOf(20),
            "PRELIMINARY",   BigDecimal.valueOf(25),
            "PRE_DEFENSE",   BigDecimal.valueOf(25),
            "FINAL",         BigDecimal.valueOf(40),
            "FINAL_DEFENSE", BigDecimal.valueOf(40)
    );

    // Map frontend aliases to DB-accepted values
    private static String canonicalStageType(String stageType) {
        if ("PRE_DEFENSE".equals(stageType))   return "PRELIMINARY";
        if ("FINAL_DEFENSE".equals(stageType)) return "FINAL";
        return stageType;
    }

    @GetMapping
    public Flux<DefenseSessionEntity> listAll(@RequestParam(required = false) String committeeId,
                                              @RequestParam(required = false) String departmentId,
                                              @RequestParam(required = false) String status,
                                              @RequestParam(required = false) String supervisorId,
                                              @RequestParam(required = false) String stageType) {
        if (supervisorId != null) return repository.findBySupervisorId(supervisorId);
        if (committeeId != null) return repository.findByCommitteeId(committeeId);
        if (departmentId != null) return repository.findByDepartmentId(departmentId);
        if (status != null) return repository.findByStatus(status);
        if (stageType != null) return repository.findByStageType(canonicalStageType(stageType));
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<DefenseSessionEntity>> getById(@PathVariable String id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-committee-stage")
    public Mono<ResponseEntity<DefenseSessionEntity>> getByCommitteeStage(
            @RequestParam String committeeId, @RequestParam String stageType) {
        return repository.findByCommitteeIdAndStageType(committeeId, stageType)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Mono<ResponseEntity<DefenseSessionEntity>> create(@RequestBody CreateDefenseSessionRequest req) {
        if (!STAGE_MAX_POINTS.containsKey(req.stageType())) {
            return Mono.just(ResponseEntity.badRequest().<DefenseSessionEntity>build());
        }
        String canonicalStage = canonicalStageType(req.stageType());
        BigDecimal maxPts = req.maxPoints() != null ? req.maxPoints() : STAGE_MAX_POINTS.get(req.stageType());

        DefenseSessionEntity entity = new DefenseSessionEntity();
        entity.setId(UUID.randomUUID().toString());
        entity.setNew(true);
        entity.setStageType(canonicalStage);
        entity.setMaxPoints(maxPts);
        entity.setStatus("PENDING");
        entity.setCreatedAt(LocalDateTime.now());
        boolean isProgress1 = "PROGRESS_1".equals(canonicalStage);
        if (isProgress1 && req.supervisorId() != null && !req.supervisorId().isBlank()) {
            // PROGRESS_1 is per-supervisor: use supervisorId as both supervisor and committee key
            entity.setSupervisorId(req.supervisorId());
            entity.setCommitteeId(req.supervisorId());
            entity.setDepartmentId(req.departmentId() != null ? req.departmentId() : "GLOBAL");
        } else {
            entity.setDepartmentId(req.departmentId() != null ? req.departmentId() : "GLOBAL");
            entity.setCommitteeId(req.committeeId() != null ? req.committeeId() : "GLOBAL");
            if (req.supervisorId() != null && !req.supervisorId().isBlank()) {
                entity.setSupervisorId(req.supervisorId());
            }
        }

        if (req.scheduledDate() != null) entity.setScheduledDate(req.scheduledDate());
        if (req.location() != null) entity.setLocation(req.location());
        if (req.notes() != null) entity.setNotes(req.notes());

        return repository.save(entity)
                .doOnNext(this::publishDeadlineIfApplicable)
                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved))
                .onErrorResume(org.springframework.dao.DuplicateKeyException.class, e ->
                    repository.findByCommitteeIdAndStageType(entity.getCommitteeId(), canonicalStage)
                            .map(ResponseEntity::ok)
                            .defaultIfEmpty(ResponseEntity.status(HttpStatus.CONFLICT).<DefenseSessionEntity>build())
                );
    }

    @PatchMapping("/{id}")
    public Mono<ResponseEntity<DefenseSessionEntity>> update(@PathVariable String id,
                                                              @RequestBody UpdateDefenseSessionRequest req) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Not found")))
                .flatMap(e -> {
                    boolean dateChanged = req.scheduledDate() != null
                            && !req.scheduledDate().equals(e.getScheduledDate());
                    if (req.scheduledDate() != null) e.setScheduledDate(req.scheduledDate());
                    if (req.location() != null) e.setLocation(req.location());
                    if (req.notes() != null) e.setNotes(req.notes());
                    e.setNew(false);
                    return repository.save(e)
                            .doOnNext(saved -> { if (dateChanged) publishDeadlineIfApplicable(saved); });
                })
                .map(ResponseEntity::ok);
    }

    @PatchMapping("/{id}/open")
    public Mono<ResponseEntity<DefenseSessionEntity>> open(@PathVariable String id,
                                                           @RequestBody(required = false) OpenCloseRequest req) {
        String actor = req != null && req.actorId() != null ? req.actorId() : "admin";
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Defense session not found")))
                .flatMap(e -> {
                    e.setStatus("ACTIVE");
                    e.setStartedBy(actor);
                    e.setStartedAt(LocalDateTime.now());
                    e.setNew(false);
                    return repository.save(e);
                })
                .map(ResponseEntity::ok);
    }

    @PatchMapping("/{id}/close")
    public Mono<ResponseEntity<DefenseSessionEntity>> close(@PathVariable String id,
                                                            @RequestBody(required = false) OpenCloseRequest req) {
        String actor = req != null && req.actorId() != null ? req.actorId() : "admin";
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Defense session not found")))
                .flatMap(e -> {
                    e.setStatus("CLOSED");
                    e.setClosedBy(actor);
                    e.setClosedAt(LocalDateTime.now());
                    e.setNew(false);
                    return repository.save(e);
                })
                .map(ResponseEntity::ok);
    }

    /**
     * Fire-and-forget publish to {@code workflow-deadline-set} when a session
     * has a {@code scheduledDate} and a single recipient we can identify.
     *
     * Coverage today:
     *   • PROGRESS_1 sessions — supervisor is the recipient (1:1).
     *
     * Skipped (logged):
     *   • Committee/department-scoped sessions (PROGRESS_2, PRELIMINARY,
     *     FINAL). They affect every student in the committee, so notifying
     *     all of them needs a cross-service committee_service lookup. That
     *     fan-out is a follow-up — for now the supervisor seeing the date in
     *     the dashboard is enough to drive behavior.
     */
    private void publishDeadlineIfApplicable(DefenseSessionEntity saved) {
        if (saved.getScheduledDate() == null) return;
        String recipient = saved.getSupervisorId();
        if (recipient == null || recipient.isBlank()) {
            log.info("workflow-deadline-set skipped: session={} stage={} has no single recipient (committee/global)",
                    saved.getId(), saved.getStageType());
            return;
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("workflowId", saved.getId());
        payload.put("thesisId", null);
        payload.put("studentId", recipient);  // recipient slot — handler notifies this user
        payload.put("stageName", saved.getStageType());
        payload.put("deadline", saved.getScheduledDate().toString());
        try {
            kafkaTemplate.send(DEADLINE_TOPIC, saved.getId(), payload);
            log.info("📤 published workflow-deadline-set: session={} stage={} deadline={}",
                    saved.getId(), saved.getStageType(), saved.getScheduledDate());
        } catch (Exception ex) {
            log.warn("Failed to publish workflow-deadline-set", ex);
        }
    }

    public record CreateDefenseSessionRequest(String departmentId, String committeeId,
                                               String supervisorId, String stageType,
                                               BigDecimal maxPoints, LocalDateTime scheduledDate,
                                               String location, String notes) {}
    public record UpdateDefenseSessionRequest(LocalDateTime scheduledDate, String location, String notes) {}
    public record OpenCloseRequest(String actorId) {}
}
