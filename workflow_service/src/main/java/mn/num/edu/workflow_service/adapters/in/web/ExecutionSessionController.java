package mn.num.edu.workflow_service.adapters.in.web;

import mn.num.edu.workflow_service.adapters.out.persistence.entity.ThesisExecutionSessionEntity;
import mn.num.edu.workflow_service.adapters.out.persistence.repository.ExecutionSessionR2dbcRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/execution-sessions")
public class ExecutionSessionController {

    private final ExecutionSessionR2dbcRepository repository;

    public ExecutionSessionController(ExecutionSessionR2dbcRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Flux<ThesisExecutionSessionEntity> listAll(@RequestParam(required = false) String departmentId,
                                                       @RequestParam(required = false) String status) {
        if (departmentId != null) return repository.findByDepartmentId(departmentId);
        if (status != null) return repository.findByStatus(status);
        return repository.findAll();
    }

    @GetMapping("/active")
    public Mono<ResponseEntity<ThesisExecutionSessionEntity>> getActive(@RequestParam(required = false) String departmentId) {
        Mono<ThesisExecutionSessionEntity> mono = departmentId != null
                ? repository.findActiveByDepartment(departmentId)
                : repository.findActive();
        return mono.map(ResponseEntity::ok).defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<ThesisExecutionSessionEntity>> getById(@PathVariable String id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Mono<ResponseEntity<ThesisExecutionSessionEntity>> create(@RequestBody CreateSessionRequest req) {
        ThesisExecutionSessionEntity entity = new ThesisExecutionSessionEntity();
        entity.setId(UUID.randomUUID().toString());
        entity.setNew(true);
        entity.setDepartmentId(req.departmentId() != null ? req.departmentId() : "GLOBAL");
        entity.setAcademicYear(req.academicYear() != null ? req.academicYear() : "2025-2026");
        entity.setSemester(req.semester() != null ? req.semester() : "SPRING");
        entity.setDurationWeeks(req.durationWeeks() != null ? req.durationWeeks() : 14);
        entity.setStatus("PENDING");
        entity.setNotes(req.notes());
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity)
                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved))
                .onErrorResume(org.springframework.dao.DuplicateKeyException.class, e ->
                        repository.findAll().next()
                                .map(existing -> ResponseEntity.ok(existing))
                                .defaultIfEmpty(ResponseEntity.status(HttpStatus.CONFLICT).<ThesisExecutionSessionEntity>build())
                );
    }

    @PatchMapping("/{id}/open")
    public Mono<ResponseEntity<ThesisExecutionSessionEntity>> open(@PathVariable String id,
                                                                    @RequestBody(required = false) OpenCloseRequest req) {
        String actor = req != null && req.actorId() != null ? req.actorId() : "admin";
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Session not found")))
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
    public Mono<ResponseEntity<ThesisExecutionSessionEntity>> close(@PathVariable String id,
                                                                     @RequestBody(required = false) OpenCloseRequest req) {
        String actor = req != null && req.actorId() != null ? req.actorId() : "admin";
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Session not found")))
                .flatMap(e -> {
                    e.setStatus("CLOSED");
                    e.setClosedBy(actor);
                    e.setClosedAt(LocalDateTime.now());
                    e.setNew(false);
                    return repository.save(e);
                })
                .map(ResponseEntity::ok);
    }

    public record CreateSessionRequest(String departmentId, String academicYear, String semester,
                                       Integer durationWeeks, String notes) {}
    public record OpenCloseRequest(String actorId) {}
}
