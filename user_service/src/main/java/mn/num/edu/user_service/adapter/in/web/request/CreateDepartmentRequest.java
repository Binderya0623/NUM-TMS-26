package mn.num.edu.user_service.adapter.in.web.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import mn.num.edu.user_service.domain.model.SystemRole;

public record CreateDepartmentRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Email @NotBlank String email,
        @NotBlank String departmentId,
        @NotBlank String departmentName) {
}