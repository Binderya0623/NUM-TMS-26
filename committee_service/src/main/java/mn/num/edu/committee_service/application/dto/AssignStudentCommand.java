package mn.num.edu.committee_service.application.dto;

import java.util.UUID;

public record AssignStudentCommand(String committeeId, String studentId, String departmentId) {}
