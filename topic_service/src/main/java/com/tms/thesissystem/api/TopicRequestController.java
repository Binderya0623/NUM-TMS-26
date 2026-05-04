package com.tms.thesissystem.api;

import com.tms.thesissystem.application.service.TopicRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v2/topic-requests")
public class TopicRequestController {

    private final TopicRequestService topicRequestService;

    public TopicRequestController(TopicRequestService topicRequestService) {
        this.topicRequestService = topicRequestService;
    }

    /**
     * GET /api/v2/topic-requests
     * Accepts: studentId, requestedById (alias), teacherId, sessionId, status
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String requestedById,   // frontend alias
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long sessionId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(topicRequestService.listRequests(studentId, requestedById, teacherId, sessionId, status));
    }

    /** GET /api/v2/topic-requests/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return topicRequestService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/v2/topic-requests
     * Student submits a topic request during an active selection session.
     *
     * Accepts:
     *   { topicId, studentId, sessionId?, motivation?, reqNote? }  (internal)
     *   { topicId, requestedById, sessionId?, motivation?, reqNote? }  (frontend)
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> submitRequest(@RequestBody SubmitRequestBody req) {
        String studentId = req.studentId() != null ? req.studentId() : req.requestedById();
        if (studentId == null || studentId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "studentId or requestedById is required"));
        }
        String motivation = req.motivation() != null ? req.motivation() : req.reqText();
        Map<String, Object> created = topicRequestService.submitRequest(
                req.sessionId(), req.topicId(), studentId, motivation, req.reqNote()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * POST /api/v2/topic-requests/{id}/approve
     * Teacher approves a request. Auto-cancels all other PENDING requests for that student.
     * Body: { teacherId }
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approve(@PathVariable Long id,
                                                        @RequestBody Map<String, String> body) {
        String teacherId = body.getOrDefault("teacherId", body.getOrDefault("actorId", "system"));
        return ResponseEntity.ok(topicRequestService.approve(id, teacherId));
    }

    /**
     * POST /api/v2/topic-requests/{id}/reject
     * Teacher rejects a request. rejectionReason is mandatory.
     * Body: { teacherId, rejectionReason }
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> reject(@PathVariable Long id,
                                                       @RequestBody RejectRequestBody req) {
        String teacherId = req.teacherId() != null ? req.teacherId() : req.actorId();
        return ResponseEntity.ok(topicRequestService.reject(id, teacherId, req.rejectionReason()));
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, String>> handleDomainError(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    // ── Request bodies ────────────────────────────────────────────────────────

    public record SubmitRequestBody(
            Long sessionId,
            Long topicId,
            String studentId,        // internal name
            String requestedById,    // frontend alias for studentId
            String motivation,       // frontend name
            String reqText,          // internal alias for motivation
            String reqNote
    ) {}

    public record RejectRequestBody(
            String teacherId,
            String actorId,          // alias
            String rejectionReason
    ) {}
}
