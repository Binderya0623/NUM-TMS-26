package mn.num.edu.thesis_service.application.dto;

import jakarta.validation.constraints.NotBlank;

public record ChangeThesisStatusCommand(
        @NotBlank String newStatus
) {
}