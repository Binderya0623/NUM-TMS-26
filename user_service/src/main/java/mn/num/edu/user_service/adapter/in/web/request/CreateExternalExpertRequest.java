package mn.num.edu.user_service.adapter.in.web.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateExternalExpertRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Email @NotBlank String email,
        String departmentId,
        String organization,
        String expertise,
        String password
) {
}
