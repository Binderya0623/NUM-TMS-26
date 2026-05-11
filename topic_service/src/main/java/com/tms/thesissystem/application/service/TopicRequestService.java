package com.tms.thesissystem.application.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class TopicRequestService {

    private final JdbcTemplate jdbc;

    public TopicRequestService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> listRequests(String studentId, String requestedById,
                                                   Long teacherId, Long sessionId, String status) {
        // requestedById is an alias for studentId (frontend sends requestedById)
        String effectiveStudent = studentId != null ? studentId : requestedById;

        StringBuilder sql = new StringBuilder(
                "SELECT tr.*, t.fields, t.program, t.status AS topic_status " +
                "FROM topic_request tr " +
                "JOIN topic t ON t.id = tr.topic_id " +
                "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();
        if (effectiveStudent != null) {
            sql.append("AND tr.requested_by_id = ? AND tr.requested_by_type = 'STUDENT' ");
            params.add(effectiveStudent);
        }
        if (teacherId != null) {
            sql.append("AND t.proposed_to_teacher_id = ? "); params.add(teacherId.toString());
        }
        if (sessionId != null) { sql.append("AND tr.session_id = ? "); params.add(sessionId); }
        if (status != null)    { sql.append("AND tr.status = ? ");     params.add(status); }
        sql.append("ORDER BY tr.created_at DESC");

        List<Map<String, Object>> rows = jdbc.queryForList(sql.toString(), params.toArray());
        return rows.stream().map(this::mapRequestRow).toList();
    }

    public Optional<Map<String, Object>> findById(Long id) {
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM topic_request WHERE id = ?", id);
        return rows.isEmpty() ? Optional.empty() : Optional.of(mapRequestRow(rows.get(0)));
    }

    /** Raw row (for internal use where we need DB columns). */
    Optional<Map<String, Object>> findRawById(Long id) {
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM topic_request WHERE id = ?", id);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    @Transactional
    public Map<String, Object> submitRequest(Long sessionId, Long topicId, String studentId,
                                              String motivation, String reqNote) {
        // Validate session is ACTIVE (if provided)
        if (sessionId != null) {
            List<Map<String, Object>> sessions = jdbc.queryForList(
                    "SELECT * FROM topic_selection_session WHERE id = ? AND status = 'ACTIVE'", sessionId);
            if (sessions.isEmpty()) {
                throw new IllegalStateException("No active selection session found with id: " + sessionId);
            }
        } else {
            // Check for any active session
            List<Map<String, Object>> activeSessions = jdbc.queryForList(
                    "SELECT * FROM topic_selection_session WHERE status = 'ACTIVE' LIMIT 1");
            if (activeSessions.isEmpty()) {
                throw new IllegalStateException("No active selection session is currently open");
            }
            sessionId = ((Number) activeSessions.get(0).get("id")).longValue();
        }

        // Validate topic is APPROVED and PUBLIC
        List<Map<String, Object>> topicRows = jdbc.queryForList(
                "SELECT * FROM topic WHERE id = ? AND status = 'APPROVED' AND visibility = 'PUBLIC' AND is_deleted = FALSE", topicId);
        if (topicRows.isEmpty()) {
            throw new IllegalArgumentException("Topic is not available for selection (must be APPROVED and PUBLIC)");
        }

        // Check student hasn't already been assigned (is_choosed=TRUE in student snapshot)
        List<Map<String, Object>> studentRows = jdbc.queryForList(
                "SELECT is_choosed FROM student WHERE sisi_id = ?", studentId);
        if (!studentRows.isEmpty() && Boolean.TRUE.equals(studentRows.get(0).get("is_choosed"))) {
            throw new IllegalStateException("Student already has an approved topic");
        }

        jdbc.update(
                "INSERT INTO topic_request (session_id, topic_id, requested_by_id, requested_by_type, req_text, req_note, status) " +
                "VALUES (?, ?, ?, 'STUDENT', ?, ?, 'PENDING')",
                sessionId, topicId, studentId, motivation, reqNote
        );

        // Increment student proposed_number in snapshot table (best-effort)
        jdbc.update("UPDATE student SET proposed_number = proposed_number + 1 WHERE sisi_id = ?", studentId);

        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT * FROM topic_request WHERE requested_by_id = ? ORDER BY id DESC LIMIT 1", studentId);
        return rows.isEmpty() ? Map.of() : mapRequestRow(rows.get(0));
    }

    @Transactional
    public Map<String, Object> approve(Long requestId, String teacherId) {
        Map<String, Object> raw = findRawById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));
        if (!"PENDING".equals(raw.get("status"))) {
            throw new IllegalStateException("Request is not in PENDING status");
        }

        // Cheapest sanity check: refuse only an outright missing/empty teacherId.
        // Earlier we also enforced the local `teacher` snapshot, but that table
        // isn't always synced with user-service for live-created teachers, so
        // legitimate approvals were rejected. The real root cause of phantom
        // supervisors was the SystemRole enum mismatch in user-service, which
        // is fixed there.
        if (teacherId == null || teacherId.isBlank()) {
            throw new IllegalArgumentException("teacherId is required to approve a topic request");
        }

        String studentId = (String) raw.get("requested_by_id");
        Long topicId = ((Number) raw.get("topic_id")).longValue();

        // Capacity check: how many slots does this topic offer, and how many
        // are already taken? Reject the approve if already full.
        Integer maxStudents = jdbc.queryForObject(
                "SELECT COALESCE(max_students, 1) FROM topic WHERE id = ?", Integer.class, topicId);
        if (maxStudents == null) maxStudents = 1;
        Integer alreadyApproved = jdbc.queryForObject(
                "SELECT COUNT(*) FROM topic_request WHERE topic_id = ? AND status = 'APPROVED'",
                Integer.class, topicId);
        if (alreadyApproved != null && alreadyApproved >= maxStudents) {
            throw new IllegalStateException(
                    "Topic capacity reached: " + alreadyApproved + "/" + maxStudents
                    + " students already selected this topic.");
        }

        // Approve this request
        jdbc.update("UPDATE topic_request SET status = 'APPROVED', is_selected = TRUE, selected_at = CURRENT_DATE, " +
                    "responded_by_id = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?", teacherId, requestId);

        // Auto-cancel all OTHER pending requests for this student (one approved
        // request per student is the workflow rule, regardless of topic capacity).
        jdbc.update("UPDATE topic_request SET status = 'CANCELLED' " +
                    "WHERE requested_by_id = ? AND status = 'PENDING' AND id != ?", studentId, requestId);

        // Only cancel other pending requests for this topic when capacity is
        // now exhausted. For multi-slot topics, leave other PENDING requests
        // alone so additional students can still be approved later.
        if (alreadyApproved != null && alreadyApproved + 1 >= maxStudents) {
            jdbc.update("UPDATE topic_request SET status = 'CANCELLED' " +
                        "WHERE topic_id = ? AND status = 'PENDING' AND id != ?", topicId, requestId);
        }

        // Mark student as having approved topic in snapshot
        jdbc.update("UPDATE student SET is_choosed = TRUE WHERE sisi_id = ?", studentId);
        List<Map<String, Object>> topicRows = jdbc.queryForList(
                "SELECT created_by_id FROM topic WHERE id = ?", topicId);
        if (!topicRows.isEmpty()) {
            String teacherSisiId = (String) topicRows.get(0).get("created_by_id");
            jdbc.update("UPDATE teacher SET num_of_choosed_stud = num_of_choosed_stud + 1 WHERE sisi_id = ?", teacherSisiId);

            // Auto-create plan — supervisor is the approving teacher, not topic creator
            List<Map<String, Object>> existingPlan = jdbc.queryForList(
                    "SELECT id FROM plan WHERE topic_request_id = ? AND status NOT IN ('APPROVED')", requestId);
            if (existingPlan.isEmpty()) {
                jdbc.update(
                        "INSERT INTO plan (topic_request_id, topic_id, student_id, supervisor_id, status, revision_count, created_at) " +
                        "VALUES (?, ?, ?, ?, 'DRAFT', 0, CURRENT_DATE)",
                        requestId, topicId, studentId, teacherId
                );
            }
        }

        return findById(requestId).orElseThrow();
    }

    @Transactional
    public Map<String, Object> reject(Long requestId, String teacherId, String rejectionReason) {
        if (rejectionReason == null || rejectionReason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is mandatory when rejecting a request");
        }
        Map<String, Object> raw = findRawById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));
        if (!"PENDING".equals(raw.get("status"))) {
            throw new IllegalStateException("Request is not in PENDING status");
        }
        jdbc.update("UPDATE topic_request SET status = 'REJECTED', rejection_reason = ?, " +
                    "responded_by_id = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?",
                rejectionReason, teacherId, requestId);
        return findById(requestId).orElseThrow();
    }

    // ── Response mapper ───────────────────────────────────────────────────────

    Map<String, Object> mapRequestRow(Map<String, Object> row) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", row.get("id"));
        result.put("topicId", row.get("topic_id"));
        result.put("requestedById", row.get("requested_by_id"));
        result.put("sessionId", row.get("session_id"));
        result.put("status", row.get("status"));
        result.put("motivation", row.get("req_text"));
        result.put("reqNote", row.get("req_note"));
        result.put("rejectionReason", row.get("rejection_reason"));
        result.put("requestedAt", row.get("created_at") != null ? row.get("created_at").toString() : null);
        result.put("respondedAt", row.get("responded_at") != null ? row.get("responded_at").toString() : null);
        result.put("respondedById", row.get("responded_by_id"));
        result.put("isSelected", row.get("is_selected"));
        return result;
    }
}
