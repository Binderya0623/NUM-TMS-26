package mn.num.edu.committee_service.adapter.in.web.request;

public record AssignStudentRequest(
        String studentId,
        String departmentId
) {}