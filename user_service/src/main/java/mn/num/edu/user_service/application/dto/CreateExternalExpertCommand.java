package mn.num.edu.user_service.application.dto;

public record CreateExternalExpertCommand(
        String firstName,
        String lastName,
        String email,
        String departmentId,
        String organization,
        String expertise,
        String password
) {
}
