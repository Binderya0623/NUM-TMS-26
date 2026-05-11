package com.tms.thesissystem.api;

import com.tms.thesissystem.application.service.TopicService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v2/topics")
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    /**
     * GET /api/v2/topics
     * Optional params: visibility, status, program, departmentId, createdById, createdByType
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listTopics(
            @RequestParam(required = false) String visibility,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String program,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String createdById,
            @RequestParam(required = false) String createdByType
    ) {
        return ResponseEntity.ok(topicService.listTopics(visibility, status, program, departmentId, createdById, createdByType));
    }

    /** GET /api/v2/topics/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTopicById(@PathVariable Long id) {
        return topicService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/v2/topics/by-teacher/{teacherId} — teacher's own topics */
    @GetMapping("/by-teacher/{teacherId}")
    public ResponseEntity<List<Map<String, Object>>> byTeacher(@PathVariable String teacherId) {
        return ResponseEntity.ok(topicService.findByCreator(teacherId, "TEACHER"));
    }

    /** GET /api/v2/topics/by-student/{studentId} — student-proposed topics */
    @GetMapping("/by-student/{studentId}")
    public ResponseEntity<List<Map<String, Object>>> byStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(topicService.findByCreator(studentId, "STUDENT"));
    }

    /**
     * POST /api/v2/topics
     * Accepts either:
     *   { createdById, createdByType, fields, keywords, ... }   (legacy nested)
     *   { createdById, createdByType, title, description, researchGoal, keywords, ... } (flat)
     *   { createdById, createdByType, supervisorId, title, description, researchGoal, status, ... } (student proposal)
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTopic(@RequestBody CreateTopicRequest req) {
        Map<String, Object> created = topicService.createTopic(
                req.createdById(), req.createdByType(),
                req.supervisorId() != null ? req.supervisorId() : req.proposedToTeacherId(),
                req.program(), req.fields(), req.keywords(),
                req.title(), req.titleEn(), req.description(), req.researchGoal(),
                req.status(), req.visibility(),
                req.maxStudents()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/v2/topics/{id}
     * Student edits a DRAFT or REJECTED proposal.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateTopic(@PathVariable Long id,
                                                            @RequestBody CreateTopicRequest req) {
        String actorId = req.createdById();
        Map<String, Object> updated = topicService.updateTopic(
                id, actorId, req.fields(), req.keywords(),
                req.title(), req.titleEn(), req.description(), req.researchGoal(),
                req.status()
        );
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/v2/topics/{id}/submit
     * Teacher approves student proposal → submit for dept review.
     * Body: { actorId } or { submittedBy }
     */
    @PostMapping("/{id}/submit")
    public ResponseEntity<Map<String, Object>> submit(@PathVariable Long id,
                                                       @RequestBody Map<String, String> body) {
        String actorId = body.getOrDefault("actorId",
                         body.getOrDefault("submittedBy",
                         body.getOrDefault("reviewedBy", "system")));
        return ResponseEntity.ok(topicService.submitForDeptReview(id, actorId));
    }

    /**
     * POST /api/v2/topics/{id}/dept-decision
     * Department approves or rejects topic.
     * Body: { decision: "APPROVE"|"REJECT", reviewedBy, rejectionReason? }
     *   OR: { approved: true|false, actorId, rejectionReason? }  (legacy)
     */
    @PostMapping("/{id}/dept-decision")
    public ResponseEntity<Map<String, Object>> deptDecision(@PathVariable Long id,
                                                              @RequestBody DeptDecisionRequest req) {
        String decision  = req.decision() != null ? req.decision() : (Boolean.TRUE.equals(req.approved()) ? "APPROVE" : "REJECT");
        String actorId   = req.reviewedBy() != null ? req.reviewedBy() : req.actorId();
        return ResponseEntity.ok(topicService.deptDecision(id, decision, actorId, req.rejectionReason()));
    }

    /** DELETE /api/v2/topics/{id} — soft-delete (teacher can delete own DRAFT) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id,
                                             @RequestParam(required = false) String actorId) {
        topicService.softDelete(id, actorId != null ? actorId : "system");
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, String>> handleDomainError(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    // ── Request bodies ────────────────────────────────────────────────────────

    public record CreateTopicRequest(
            // Required
            String createdById,
            String createdByType,
            // Teacher reference (accept both names)
            String supervisorId,
            String proposedToTeacherId,
            // Content – either nested or flat
            Object fields,
            String title,
            // English title (NUM TMS requires bilingual topic naming)
            String titleEn,
            String description,
            String researchGoal,
            // Metadata
            String program,
            String keywords,
            // Allow caller to set initial status (e.g. DRAFT vs PENDING_TEACHER_APPROVAL)
            String status,
            // Visibility: PUBLIC or PRIVATE (defaults to PRIVATE if omitted)
            String visibility,
            // How many students can be approved on this topic. Default 1.
            // Boxed Integer so the FE can omit the field for legacy clients.
            Integer maxStudents
    ) {}

    /**
     * Accepts both formats:
     *   { decision: "APPROVE"|"REJECT", reviewedBy: "...", rejectionReason: "..." }
     *   { approved: true|false, actorId: "...", rejectionReason: "..." }
     */
    public record DeptDecisionRequest(
            String decision,
            String reviewedBy,
            String actorId,
            Boolean approved,
            String rejectionReason
    ) {}
}
