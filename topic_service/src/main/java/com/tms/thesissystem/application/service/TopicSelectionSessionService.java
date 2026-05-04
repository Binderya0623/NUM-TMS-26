package com.tms.thesissystem.application.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TopicSelectionSessionService {

    private final JdbcTemplate jdbc;

    public TopicSelectionSessionService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> listSessions(Long departmentId, String status) {
        StringBuilder sql = new StringBuilder("SELECT * FROM topic_selection_session WHERE 1=1 ");
        List<Object> params = new ArrayList<>();
        if (departmentId != null) { sql.append("AND (department_id = ? OR department_id IS NULL) "); params.add(departmentId); }
        if (status != null) { sql.append("AND status = ? "); params.add(status); }
        sql.append("ORDER BY created_at DESC");
        return jdbc.queryForList(sql.toString(), params.toArray());
    }

    public Optional<Map<String, Object>> findActiveSession(Long departmentId) {
        List<Map<String, Object>> rows;
        if (departmentId != null) {
            rows = jdbc.queryForList(
                    "SELECT * FROM topic_selection_session WHERE status = 'ACTIVE' AND (department_id = ? OR department_id IS NULL) ORDER BY created_at DESC LIMIT 1",
                    departmentId);
        } else {
            rows = jdbc.queryForList(
                    "SELECT * FROM topic_selection_session WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1");
        }
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public Optional<Map<String, Object>> findById(Long id) {
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM topic_selection_session WHERE id = ?", id);
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    @Transactional
    public Map<String, Object> createSession(Long departmentId, String academicYear, String semester,
                                              Integer durationDays, LocalDateTime startDate,
                                              LocalDateTime endDate, String createdBy) {
        if (endDate != null && startDate != null && !endDate.isAfter(startDate)) {
            throw new IllegalArgumentException("end_date must be after start_date");
        }
        int days = durationDays != null ? durationDays : 5;

        jdbc.update(
                "INSERT INTO topic_selection_session (department_id, academic_year, semester, duration_days, start_date, end_date, status, created_by) " +
                "VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)",
                departmentId, academicYear, semester, days, startDate, endDate, createdBy
        );
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT * FROM topic_selection_session WHERE created_by = ? ORDER BY id DESC LIMIT 1", createdBy);
        return rows.isEmpty() ? Map.of() : rows.get(0);
    }

    @Transactional
    public Map<String, Object> openSession(Long id, String actorId) {
        Map<String, Object> session = findById(id).orElseThrow(() -> new IllegalArgumentException("Session not found: " + id));
        String status = (String) session.get("status");
        if (!"PENDING".equals(status) && !"CLOSED".equals(status)) {
            throw new IllegalStateException("Session cannot be opened from status: " + status);
        }
        jdbc.update("UPDATE topic_selection_session SET status = 'ACTIVE', closed_by = NULL, closed_at = NULL WHERE id = ?", id);
        return findById(id).orElseThrow();
    }

    @Transactional
    public Map<String, Object> closeSession(Long id, String actorId) {
        Map<String, Object> session = findById(id).orElseThrow(() -> new IllegalArgumentException("Session not found: " + id));
        if (!"ACTIVE".equals(session.get("status"))) {
            throw new IllegalStateException("Session is not ACTIVE");
        }
        jdbc.update("UPDATE topic_selection_session SET status = 'CLOSED', closed_by = ?, closed_at = CURRENT_TIMESTAMP WHERE id = ?",
                actorId, id);
        return findById(id).orElseThrow();
    }
}
