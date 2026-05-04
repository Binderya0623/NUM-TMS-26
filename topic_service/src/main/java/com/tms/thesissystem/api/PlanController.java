package com.tms.thesissystem.api;

import com.tms.thesissystem.application.service.PlanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v2/plans")
public class PlanController {

    private final PlanService planService;
    private final JdbcTemplate jdbc;

    public PlanController(PlanService planService, JdbcTemplate jdbc) {
        this.planService = planService;
        this.jdbc = jdbc;
    }

    /** GET /api/v2/plans?studentId=xxx&supervisorId=yyy&status=SUBMITTED */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listPlans(
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String supervisorId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(planService.listPlans(studentId, supervisorId, status));
    }

    /** GET /api/v2/plans/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return planService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/v2/plans/{id}/weeks — get weekly tasks */
    @GetMapping("/{id}/weeks")
    public ResponseEntity<List<Map<String, Object>>> getWeeks(@PathVariable Long id) {
        return ResponseEntity.ok(planService.getWeeks(id));
    }

    /** POST /api/v2/plans — create a draft plan (after topic_request is APPROVED) */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createPlan(@RequestBody CreatePlanRequest req) {
        Map<String, Object> created = planService.createPlan(
                req.topicRequestId(), req.topicId(), req.studentId(), req.supervisorId(), req.weeks()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** POST /api/v2/plans/{id}/weeks — upsert a single week (frontend upsertWeek) */
    @PostMapping("/{id}/weeks")
    public ResponseEntity<Map<String, Object>> upsertSingleWeek(@PathVariable Long id,
                                                                  @RequestBody Map<String, Object> body) {
        int weekNumber = body.get("weekNumber") != null ? ((Number) body.get("weekNumber")).intValue() : 0;
        String task = body.getOrDefault("plannedTasks", body.getOrDefault("description", "")).toString();
        planService.updateWeeks(id, null, List.of(new WeekInput(weekNumber, task)));
        List<Map<String, Object>> weeks = planService.getWeeks(id);
        Map<String, Object> saved = weeks.stream()
                .filter(w -> weekNumber == ((Number) w.get("week_number")).intValue())
                .findFirst().orElse(Map.of());
        return ResponseEntity.ok(saved);
    }

    /** PUT /api/v2/plans/{id}/weeks — bulk update weekly tasks */
    @PutMapping("/{id}/weeks")
    public ResponseEntity<Map<String, Object>> updateWeeks(@PathVariable Long id,
                                                            @RequestBody UpdateWeeksRequest req) {
        return ResponseEntity.ok(planService.updateWeeks(id, req.studentId(), req.weeks()));
    }

    /** PUT /api/v2/plans/{id}/weeks/{weekId} — update a single week by id */
    @PutMapping("/{id}/weeks/{weekId}")
    public ResponseEntity<Map<String, Object>> updateSingleWeek(@PathVariable Long id,
                                                                  @PathVariable Long weekId,
                                                                  @RequestBody Map<String, Object> body) {
        String task = body.getOrDefault("plannedTasks", body.getOrDefault("description", "")).toString();
        jdbc.update("UPDATE plan_week SET task = ? WHERE id = ? AND plan_id = ?", task, weekId, id);
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM plan_week WHERE id = ?", weekId);
        return ResponseEntity.ok(rows.isEmpty() ? Map.of() : rows.get(0));
    }

    /** POST /api/v2/plans/{id}/submit — student submits plan for supervisor review */
    @PostMapping("/{id}/submit")
    public ResponseEntity<Map<String, Object>> submit(@PathVariable Long id,
                                                       @RequestBody(required = false) Map<String, String> body) {
        String studentId = body != null
                ? body.getOrDefault("studentId", body.getOrDefault("actorId", "system"))
                : "system";
        return ResponseEntity.ok(planService.submitPlan(id, studentId));
    }

    /** POST /api/v2/plans/{id}/upload — student uploads plan document */
    @PostMapping("/{id}/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @PathVariable Long id,
            @RequestParam String studentId,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(planService.uploadFile(id, studentId, file));
    }

    /** POST /api/v2/plans/{id}/review — supervisor approves or requests revision */
    @PostMapping("/{id}/review")
    public ResponseEntity<Map<String, Object>> review(@PathVariable Long id,
                                                       @RequestBody ReviewRequest req) {
        return ResponseEntity.ok(planService.supervisorReview(id, req.supervisorId(), req.decision(), req.feedback()));
    }

    /** GET /api/v2/plans/{id}/reviews — review history */
    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<Map<String, Object>>> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(planService.getReviews(id));
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, String>> handleDomainError(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    public record CreatePlanRequest(
            Long topicRequestId, Long topicId, String studentId, String supervisorId,
            List<WeekInput> weeks
    ) {}
    public record UpdateWeeksRequest(String studentId, List<WeekInput> weeks) {}
    public record WeekInput(int weekNumber, String task) {}
    public record ReviewRequest(String supervisorId, String decision, String feedback) {}
}
