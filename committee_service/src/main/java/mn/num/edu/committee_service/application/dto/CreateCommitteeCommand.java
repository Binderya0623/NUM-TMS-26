package mn.num.edu.committee_service.application.dto;

public record CreateCommitteeCommand(String departmentId, String name, String defenseType) {}