package com.tms.thesissystem.api;

import com.tms.thesissystem.application.service.TopicSelectionSessionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v2/selection-sessions")
public class TopicSelectionSessionController {

    private final TopicSelectionSessionService sessionService;

    public TopicSelectionSessionController(TopicSelectionSessionService sessionService) {
        this.sessionService = sessionService;
    }

    /** GET /api/v2/selection-sessions — list all sessions */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listSessions(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(sessionService.listSessions(departmentId, status));
    }

    /** GET /api/v2/selection-sessions/active — current active session */
    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActiveSession(
            @RequestParam(required = false) Long departmentId
    ) {
        return sessionService.findActiveSession(departmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/v2/selection-sessions/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return sessionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** POST /api/v2/selection-sessions — admin creates a session */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createSession(@RequestBody CreateSessionRequest req) {
        Map<String, Object> created = sessionService.createSession(
                req.departmentId(), req.academicYear(), req.semester(),
                req.durationDays(), req.startDate(), req.endDate(), req.createdBy()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** PATCH /api/v2/selection-sessions/{id}/open — admin opens the session */
    @PatchMapping("/{id}/open")
    public ResponseEntity<Map<String, Object>> openSession(@PathVariable Long id,
                                                            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(sessionService.openSession(id, body.getOrDefault("actorId", "system")));
    }

    /** PATCH /api/v2/selection-sessions/{id}/close — admin closes the session */
    @PatchMapping("/{id}/close")
    public ResponseEntity<Map<String, Object>> closeSession(@PathVariable Long id,
                                                             @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(sessionService.closeSession(id, body.getOrDefault("actorId", "system")));
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, String>> handleDomainError(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    public record CreateSessionRequest(
            Long departmentId,
            String academicYear,
            String semester,
            Integer durationDays,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String createdBy
    ) {}
}
