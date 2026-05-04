package mn.num.edu.user_service.adapter.in.web.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateTeacherRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Email @NotBlank String email,
        @NotBlank String departmentId,
        @NotBlank String position
) {
}