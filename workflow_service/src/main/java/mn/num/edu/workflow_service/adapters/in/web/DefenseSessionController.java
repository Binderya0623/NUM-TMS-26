package mn.num.edu.workflow_service.adapters.in.web;

import mn.num.edu.workflow_service.adapters.out.persistence.entity.DefenseSessionEntity;
import mn.num.edu.workflow_service.adapters.out.persistence.repository.DefenseSessionR2dbcRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/defense-sessions")
public class DefenseSessionController {

    private final DefenseSessionR2dbcRepository repository;

    public DefenseSessionController(DefenseSessionR2dbcRepository repository) {
        this.repository = repository;
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
        boolean isProgress1 = "PROGRESS_1".equals(req.stageType());
        if (isProgress1 && (req.supervisorId() == null || req.supervisorId().isBlank())) {
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

        if (isProgress1) {
            entity.setSupervisorId(req.supervisorId());
        } else {
            entity.setDepartmentId(req.departmentId() != null ? req.departmentId() : "GLOBAL");
            entity.setCommitteeId(req.committeeId() != null ? req.committeeId() : "GLOBAL");
        }

        if (req.scheduledDate() != null) entity.setScheduledDate(req.scheduledDate());
        if (req.location() != null) entity.setLocation(req.location());
        if (req.notes() != null) entity.setNotes(req.notes());

        return repository.save(entity)
                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved))
                .onErrorResume(org.springframework.dao.DuplicateKeyException.class, e -> {
                    Mono<DefenseSessionEntity> finder = isProgress1
                            ? repository.findBySupervisorIdAndStageType(entity.getSupervisorId(), canonicalStage)
                            : repository.findByCommitteeIdAndStageType(entity.getCommitteeId(), canonicalStage);
                    return finder.map(ResponseEntity::ok)
                            .defaultIfEmpty(ResponseEntity.status(HttpStatus.CONFLICT).<DefenseSessionEntity>build());
                });
    }

    @PatchMapping("/{id}")
    public Mono<ResponseEntity<DefenseSessionEntity>> update(@PathVariable String id,
                                                              @RequestBody UpdateDefenseSessionRequest req) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Not found")))
                .flatMap(e -> {
                    if (req.scheduledDate() != null) e.setScheduledDate(req.scheduledDate());
                    if (req.location() != null) e.setLocation(req.location());
                    if (req.notes() != null) e.setNotes(req.notes());
                    e.setNew(false);
                    return repository.save(e);
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

    public record CreateDefenseSessionRequest(String departmentId, String committeeId,
                                               String supervisorId, String stageType,
                                               BigDecimal maxPoints, LocalDateTime scheduledDate,
                                               String location, String notes) {}
    public record UpdateDefenseSessionRequest(LocalDateTime scheduledDate, String location, String notes) {}
    public record OpenCloseRequest(String actorId) {}
}
