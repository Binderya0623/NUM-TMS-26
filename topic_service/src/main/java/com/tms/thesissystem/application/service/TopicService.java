package com.tms.thesissystem.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class TopicService {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    public TopicService(JdbcTemplate jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    public List<Map<String, Object>> listTopics(String visibility, String status, String program,
                                                  Long departmentId, String createdById, String createdByType) {
        StringBuilder sql = new StringBuilder("SELECT * FROM topic WHERE is_deleted = FALSE ");
        List<Object> params = new ArrayList<>();

        if (visibility != null)    { sql.append("AND visibility = ? ");        params.add(visibility); }
        // PUBLIC topics are only meaningful when APPROVED; enforce this server-side
        if ("PUBLIC".equalsIgnoreCase(visibility) && status == null) {
            sql.append("AND status = 'APPROVED' ");
        } else if (status != null) { sql.append("AND status = ? ");            params.add(status); }
        if (program != null)       { sql.append("AND program = ? ");           params.add(program); }
        if (createdById != null)   { sql.append("AND created_by_id = ? ");     params.add(createdById); }
        if (createdByType != null) { sql.append("AND created_by_type = ? ");   params.add(createdByType); }
        sql.append("ORDER BY created_at_ts DESC");

        List<Map<String, Object>> rows = jdbc.queryForList(sql.toString(), params.toArray());
        return rows.stream().map(this::mapTopicRow).toList();
    }

    public Optional<Map<String, Object>> findById(Long id) {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT * FROM topic WHERE id = ? AND is_deleted = FALSE", id);
        return rows.isEmpty() ? Optional.empty() : Optional.of(mapTopicRow(rows.get(0)));
    }

    public List<Map<String, Object>> findByCreator(String createdById, String createdByType) {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT * FROM topic WHERE created_by_id = ? AND created_by_type = ? AND is_deleted = FALSE ORDER BY created_at_ts DESC",
                createdById, createdByType);
        return rows.stream().map(this::mapTopicRow).toList();
    }

    @Transactional
    public Map<String, Object> createTopic(String createdById, String createdByType, String proposedToTeacherId,
                                            String program, Object fields, String keywords,
                                            String title, String description, String researchGoal,
                                            String requestedStatus, String requestedVisibility) {
        // Build fields JSON from either nested object or top-level title/description/researchGoal
        Map<String, Object> fieldsMap = new LinkedHashMap<>();
        if (fields instanceof Map<?, ?> m) {
            m.forEach((k, v) -> fieldsMap.put(String.valueOf(k), v));
        } else if (fields instanceof String s && !s.isBlank()) {
            try {
                Map<?, ?> parsed = objectMapper.readValue(s, Map.class);
                parsed.forEach((k, v) -> fieldsMap.put(String.valueOf(k), v));
            } catch (Exception ignored) {}
        }
        // Top-level convenience fields override nested
        if (title != null)        fieldsMap.put("title", title);
        if (description != null)  fieldsMap.put("description", description);
        if (researchGoal != null) fieldsMap.put("researchGoal", researchGoal);

        String fieldsJson = toJson(fieldsMap);

        // Determine initial status
        String initialStatus;
        if (requestedStatus != null && List.of("DRAFT", "PENDING_TEACHER_APPROVAL", "PENDING_DEPT_APPROVAL").contains(requestedStatus)) {
            initialStatus = requestedStatus;
        } else {
            initialStatus = "TEACHER".equalsIgnoreCase(createdByType) ? "PENDING_DEPT_APPROVAL" : "PENDING_TEACHER_APPROVAL";
        }
        String visibility = (requestedVisibility != null && List.of("PUBLIC", "PRIVATE").contains(requestedVisibility.toUpperCase()))
                ? requestedVisibility.toUpperCase() : "PRIVATE";

        jdbc.update(
                "INSERT INTO topic (created_by_id, created_by_type, proposed_to_teacher_id, program, fields, keywords, visibility, status, created_at, created_at_ts, updated_at) " +
                "VALUES (?, ?, ?, ?, ?::json, ?, ?, ?, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                createdById, createdByType, proposedToTeacherId, program, fieldsJson, keywords, visibility, initialStatus
        );

        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT * FROM topic WHERE created_by_id = ? AND created_by_type = ? ORDER BY id DESC LIMIT 1",
                createdById, createdByType);
        return rows.isEmpty() ? Map.of() : mapTopicRow(rows.get(0));
    }

    @Transactional
    public Map<String, Object> updateTopic(Long topicId, String actorId, Object fields, String keywords,
                                            String title, String description, String researchGoal,
                                            String requestedStatus) {
        Map<String, Object> topic = findById(topicId)
                .orElseThrow(() -> new IllegalArgumentException("Topic not found: " + topicId));
        String currentStatus = (String) topic.get("status");
        if (!"DRAFT".equals(currentStatus) && !"REJECTED".equals(currentStatus)) {
            throw new IllegalStateException("Topic cannot be edited in status: " + currentStatus);
        }

        // Re-build fields merging existing + new
        Map<String, Object> existing = getRawFields(topicId);
        if (fields instanceof Map<?, ?> m) m.forEach((k, v) -> existing.put(String.valueOf(k), v));
        if (title != null)        existing.put("title", title);
        if (description != null)  existing.put("description", description);
        if (researchGoal != null) existing.put("researchGoal", researchGoal);
        String fieldsJson = toJson(existing);

        String newStatus = (requestedStatus != null && List.of("DRAFT", "PENDING_TEACHER_APPROVAL").contains(requestedStatus))
                ? requestedStatus : currentStatus;

        jdbc.update("UPDATE topic SET fields = ?::json, keywords = COALESCE(?, keywords), status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                fieldsJson, keywords, newStatus, topicId);
        return findById(topicId).orElseThrow();
    }

    @Transactional
    public Map<String, Object> submitForDeptReview(Long topicId, String actorId) {
        Map<String, Object> topic = findById(topicId)
                .orElseThrow(() -> new IllegalArgumentException("Topic not found: " + topicId));
        String status = (String) topic.get("status");
        if (!"DRAFT".equals(status) && !"PENDING_TEACHER_APPROVAL".equals(status)) {
            throw new IllegalStateException("Cannot submit topic in status: " + status);
        }
        jdbc.update("UPDATE topic SET status = 'PENDING_DEPT_APPROVAL', updated_at = CURRENT_TIMESTAMP WHERE id = ?", topicId);
        return findById(topicId).orElseThrow();
    }

    @Transactional
    public Map<String, Object> deptDecision(Long topicId, String decision, String actorId, String rejectionReason) {
        Map<String, Object> topic = findById(topicId)
                .orElseThrow(() -> new IllegalArgumentException("Topic not found: " + topicId));
        // Allow admin to approve/reject from any non-terminal status
        String currentStatus = (String) topic.get("status");
        if ("APPROVED".equals(currentStatus) || "REJECTED".equals(currentStatus)) {
            throw new IllegalStateException("Topic is already in terminal status: " + currentStatus);
        }
        boolean approved = "APPROVE".equalsIgnoreCase(decision) || "true".equalsIgnoreCase(decision);
        if (approved) {
            // Student-proposed topics are kept PRIVATE — they belong to that one
            // student and aren't a public catalog entry. Teacher-proposed topics
            // become PUBLIC so other students can browse them.
            String createdByType = (String) topic.get("createdByType");
            String visibility = "STUDENT".equalsIgnoreCase(createdByType) ? "PRIVATE" : "PUBLIC";

            jdbc.update("UPDATE topic SET status = 'APPROVED', visibility = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    visibility, topicId);

            // For student-proposed topics, automatically materialise the
            // student↔topic ownership as an APPROVED topic_request. This is
            // what UIs already use to figure out "the student's chosen topic".
            // Without this row the student would have to manually file a
            // request against their own approved proposal.
            if ("STUDENT".equalsIgnoreCase(createdByType)) {
                String studentId   = (String) topic.get("createdById");
                String supervisor  = (String) topic.get("supervisorId");
                Long activeSession = jdbc.query(
                        "SELECT id FROM topic_selection_session WHERE status = 'OPEN' ORDER BY id DESC LIMIT 1",
                        rs -> rs.next() ? rs.getLong(1) : null);

                // Skip if a row already exists for this (student, topic) pair —
                // makes the operation idempotent.
                Integer existing = jdbc.queryForObject(
                        "SELECT COUNT(*) FROM topic_request WHERE topic_id = ? AND requested_by_id = ?",
                        Integer.class, topicId, studentId);
                if (existing == null || existing == 0) {
                    jdbc.update(
                            "INSERT INTO topic_request " +
                            "  (session_id, topic_id, requested_by_id, requested_by_type, status, " +
                            "   is_selected, selected_at, responded_by_id, responded_at, req_text) " +
                            "VALUES (?, ?, ?, 'STUDENT', 'APPROVED', TRUE, CURRENT_DATE, ?, CURRENT_TIMESTAMP, ?)",
                            activeSession, topicId, studentId,
                            supervisor != null ? supervisor : actorId,
                            "Auto-linked from approved student proposal"
                    );
                    // Best-effort: bump the student's proposed_number snapshot.
                    jdbc.update("UPDATE student SET proposed_number = COALESCE(proposed_number, 0) + 1 WHERE sisi_id = ?",
                            studentId);
                }
            }
        } else {
            if (rejectionReason == null || rejectionReason.isBlank()) {
                throw new IllegalArgumentException("Rejection reason is required");
            }
            jdbc.update("UPDATE topic SET status = 'REJECTED', rejection_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    rejectionReason, topicId);
        }
        return findById(topicId).orElseThrow();
    }

    @Transactional
    public void softDelete(Long topicId, String actorId) {
        Map<String, Object> topic = findById(topicId)
                .orElseThrow(() -> new IllegalArgumentException("Topic not found: " + topicId));
        if (!"DRAFT".equals(topic.get("status"))) {
            throw new IllegalStateException("Only DRAFT topics can be deleted");
        }
        jdbc.update("UPDATE topic SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?", topicId);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> getRawFields(Long topicId) {
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT fields FROM topic WHERE id = ?", topicId);
        if (rows.isEmpty()) return new LinkedHashMap<>();
        Object raw = rows.get(0).get("fields");
        if (raw == null) return new LinkedHashMap<>();
        try { return (Map<String, Object>) objectMapper.readValue(raw.toString(), Map.class); }
        catch (Exception e) { return new LinkedHashMap<>(); }
    }

    /** Transform a raw DB row into the camelCase/flattened format the frontend expects. */
    @SuppressWarnings("unchecked")
    Map<String, Object> mapTopicRow(Map<String, Object> row) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", row.get("id"));
        result.put("status", row.get("status"));
        result.put("visibility", row.get("visibility"));
        result.put("createdByType", row.get("created_by_type"));
        result.put("createdById", row.get("created_by_id"));
        result.put("supervisorId", row.get("proposed_to_teacher_id"));
        result.put("program", row.get("program"));
        result.put("keywords", row.get("keywords"));
        result.put("rejectionReason", row.get("rejection_reason"));

        Object ts = row.get("created_at_ts");
        result.put("createdAt", ts != null ? ts.toString() : (row.get("created_at") != null ? row.get("created_at").toString() : null));

        // Parse fields JSON → flatten title, description, researchGoal
        Object fieldsRaw = row.get("fields");
        if (fieldsRaw != null) {
            try {
                Map<String, Object> f = (Map<String, Object>) objectMapper.readValue(fieldsRaw.toString(), Map.class);
                result.put("title", f.get("title"));
                result.put("description", f.get("description"));
                result.put("researchGoal", f.get("researchGoal"));
                // carry through any other fields
                f.forEach((k, v) -> result.putIfAbsent(k, v));
            } catch (Exception ignored) {
                result.put("title", null);
                result.put("description", null);
                result.put("researchGoal", null);
            }
        } else {
            result.put("title", null);
            result.put("description", null);
            result.put("researchGoal", null);
        }
        return result;
    }

    private String toJson(Object obj) {
        if (obj == null) return "{}";
        if (obj instanceof String s) return s.isBlank() ? "{}" : s;
        try { return objectMapper.writeValueAsString(obj); }
        catch (Exception e) { return "{}"; }
    }
}
