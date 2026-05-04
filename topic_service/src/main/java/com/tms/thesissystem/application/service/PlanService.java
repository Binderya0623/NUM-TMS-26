package com.tms.thesissystem.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tms.thesissystem.api.PlanController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
public class PlanService {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    @Value("${app.upload.dir:${java.io.tmpdir}/thesis-uploads/plans}")
    private String uploadDir;

    public PlanService(JdbcTemplate jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    public List<Map<String, Object>> listPlans(String studentId, String supervisorId, String status) {
        StringBuilder sql = new StringBuilder(
            "SELECT p.*, t.fields AS topic_fields FROM plan p " +
            "LEFT JOIN topic t ON t.id = p.topic_id WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();
        if (studentId != null)    { sql.append("AND p.student_id = ? ");    params.add(studentId); }
        if (supervisorId != null) { sql.append("AND p.supervisor_id = ? "); params.add(supervisorId); }
        if (status != null)       { sql.append("AND p.status = ? ");        params.add(status); }
        sql.append("ORDER BY p.id DESC");
        return jdbc.queryForList(sql.toString(), params.toArray())
                   .stream().map(this::mapPlanRow).toList();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> mapPlanRow(Map<String, Object> row) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", row.get("id"));
        m.put("studentId", row.get("student_id"));
        m.put("supervisorId", row.get("supervisor_id"));
        m.put("topicId", row.get("topic_id"));
        m.put("topicRequestId", row.get("topic_request_id"));
        m.put("status", row.get("status"));
        m.put("revisionCount", row.get("revision_count"));
        m.put("createdAt", row.get("created_at") != null ? row.get("created_at").toString() : null);
        m.put("submittedAt", row.get("submitted_at") != null ? row.get("submitted_at").toString() : null);
        m.put("currentFilePath", row.get("current_file_path"));
        // Extract title from joined topic fields JSON
        Object tf = row.get("topic_fields");
        String title = null;
        if (tf != null) {
            try {
                Map<?, ?> fields = objectMapper.readValue(tf.toString(), Map.class);
                title = (String) fields.get("title");
            } catch (Exception ignored) {}
        }
        m.put("title", title);
        return m;
    }

    public Optional<Map<String, Object>> findById(Long id) {
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM plan WHERE id = ?", id);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public List<Map<String, Object>> getWeeks(Long planId) {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT * FROM plan_week WHERE plan_id = ? ORDER BY week_number", planId);
        return rows.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>(row);
            m.put("weekNumber", row.get("week_number"));
            m.put("planId", row.get("plan_id"));
            m.put("plannedTasks", row.get("task"));   // map DB column → frontend field
            return m;
        }).toList();
    }

    public List<Map<String, Object>> getReviews(Long planId) {
        return jdbc.queryForList("SELECT * FROM plan_review WHERE plan_id = ? ORDER BY reviewed_at DESC", planId);
    }

    @Transactional
    public Map<String, Object> createPlan(Long topicRequestId, Long topicId, String studentId,
                                           String supervisorId, List<PlanController.WeekInput> weeks) {
        // Validate topic_request is APPROVED
        List<Map<String, Object>> reqRows = jdbc.queryForList(
                "SELECT * FROM topic_request WHERE id = ? AND status = 'APPROVED'", topicRequestId);
        if (reqRows.isEmpty()) {
            throw new IllegalStateException("Topic request is not approved");
        }
        // Prevent duplicate active plan for same topic_request
        List<Map<String, Object>> existing = jdbc.queryForList(
                "SELECT id FROM plan WHERE topic_request_id = ? AND status NOT IN ('APPROVED')", topicRequestId);
        if (!existing.isEmpty()) {
            throw new IllegalStateException("A plan already exists for this topic request");
        }

        jdbc.update(
                "INSERT INTO plan (topic_request_id, topic_id, student_id, supervisor_id, status, revision_count, created_at) " +
                "VALUES (?, ?, ?, ?, 'DRAFT', 0, CURRENT_DATE)",
                topicRequestId, topicId, studentId, supervisorId
        );
        List<Map<String, Object>> planRows = jdbc.queryForList(
                "SELECT * FROM plan WHERE student_id = ? ORDER BY id DESC LIMIT 1", studentId);
        if (planRows.isEmpty()) return Map.of();
        Map<String, Object> plan = planRows.get(0);
        Long planId = ((Number) plan.get("id")).longValue();

        // Insert weeks
        if (weeks != null) {
            for (PlanController.WeekInput w : weeks) {
                jdbc.update("INSERT INTO plan_week (plan_id, week_number, task) VALUES (?, ?, ?)",
                        planId, w.weekNumber(), w.task());
            }
        }
        return plan;
    }

    @Transactional
    public Map<String, Object> updateWeeks(Long planId, String studentId, List<PlanController.WeekInput> weeks) {
        Map<String, Object> plan = findById(planId).orElseThrow(() -> new IllegalArgumentException("Plan not found: " + planId));
        String status = (String) plan.get("status");
        if (!"DRAFT".equals(status) && !"REVISION_REQUIRED".equals(status)) {
            throw new IllegalStateException("Plan cannot be edited in status: " + status);
        }
        if (weeks != null) {
            for (PlanController.WeekInput w : weeks) {
                int updated = jdbc.update(
                        "UPDATE plan_week SET task = ? WHERE plan_id = ? AND week_number = ?",
                        w.task(), planId, w.weekNumber());
                if (updated == 0) {
                    jdbc.update("INSERT INTO plan_week (plan_id, week_number, task) VALUES (?, ?, ?)",
                            planId, w.weekNumber(), w.task());
                }
            }
        }
        return findById(planId).orElseThrow();
    }

    @Transactional
    public Map<String, Object> submitPlan(Long planId, String studentId) {
        Map<String, Object> plan = findById(planId).orElseThrow(() -> new IllegalArgumentException("Plan not found: " + planId));
        String status = (String) plan.get("status");
        if (!"DRAFT".equals(status) && !"REVISION_REQUIRED".equals(status)) {
            throw new IllegalStateException("Plan cannot be submitted in status: " + status);
        }
        jdbc.update("UPDATE plan SET status = 'SUBMITTED', submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?", planId);
        return findById(planId).orElseThrow();
    }

    @Transactional
    public Map<String, Object> uploadFile(Long planId, String studentId, MultipartFile file) {
        findById(planId).orElseThrow(() -> new IllegalArgumentException("Plan not found: " + planId));
        try {
            Path dir = Paths.get(uploadDir, String.valueOf(planId));
            Files.createDirectories(dir);
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path stored = dir.resolve(filename);
            Files.copy(file.getInputStream(), stored, StandardCopyOption.REPLACE_EXISTING);

            List<Map<String, Object>> planRows = jdbc.queryForList("SELECT revision_count FROM plan WHERE id = ?", planId);
            int revCount = planRows.isEmpty() ? 0 : ((Number) planRows.get(0).get("revision_count")).intValue();

            jdbc.update(
                    "INSERT INTO plan_file (plan_id, submission_number, original_filename, stored_path, file_size, mime_type, uploaded_by) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    planId, revCount + 1, file.getOriginalFilename(), stored.toString(), file.getSize(), file.getContentType(), studentId
            );
            jdbc.update("UPDATE plan SET current_file_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", stored.toString(), planId);

            return Map.of("storedPath", stored.toString(), "originalFilename", file.getOriginalFilename());
        } catch (IOException e) {
            throw new IllegalStateException("File upload failed: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> supervisorReview(Long planId, String supervisorId, String decision, String feedback) {
        if ("REVISION_REQUIRED".equals(decision) && (feedback == null || feedback.isBlank())) {
            throw new IllegalArgumentException("Feedback is required when requesting revision");
        }
        Map<String, Object> plan = findById(planId).orElseThrow(() -> new IllegalArgumentException("Plan not found: " + planId));
        if (!"SUBMITTED".equals(plan.get("status"))) {
            throw new IllegalStateException("Plan is not in SUBMITTED status");
        }

        jdbc.update(
                "INSERT INTO plan_review (plan_id, supervisor_id, decision, feedback) VALUES (?, ?, ?, ?)",
                planId, supervisorId, decision, feedback
        );

        String newStatus = "APPROVED".equals(decision) ? "APPROVED" : "REVISION_REQUIRED";
        String updateSql = "REVISION_REQUIRED".equals(decision)
                ? "UPDATE plan SET status = ?, revision_count = revision_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
                : "UPDATE plan SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        jdbc.update(updateSql, newStatus, planId);

        return findById(planId).orElseThrow();
    }
}
