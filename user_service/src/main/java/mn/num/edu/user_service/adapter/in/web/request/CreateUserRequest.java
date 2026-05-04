package mn.num.edu.user_service.adapter.in.web.request;

import mn.num.edu.user_service.domain.model.SystemRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateUserRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Email @NotBlank String email,
        @NotNull SystemRole systemRole
) {
}