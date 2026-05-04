package com.tms.thesissystem.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v2/students")
public class StudentSnapshotController {

    private final JdbcTemplate jdbc;

    public StudentSnapshotController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** GET /api/v2/students — returns student snapshot rows with program field */
    @GetMapping
    public List<Map<String, Object>> list() {
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT sisi_id, program FROM student");
        return rows.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("sisiId", r.get("sisi_id"));
            m.put("program", r.get("program"));
            return m;
        }).toList();
    }
}
