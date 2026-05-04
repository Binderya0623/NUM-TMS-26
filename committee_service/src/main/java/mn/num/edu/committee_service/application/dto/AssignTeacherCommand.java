package mn.num.edu.committee_service.application.dto;

import mn.num.edu.committee_service.domain.model.CommitteeRole;

import java.util.UUID;

public record AssignTeacherCommand(String committeeId, String teacherId, CommitteeRole role, String departmentId) {}