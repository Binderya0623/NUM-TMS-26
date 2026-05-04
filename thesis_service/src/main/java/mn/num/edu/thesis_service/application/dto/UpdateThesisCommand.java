package mn.num.edu.thesis_service.application.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateThesisCommand(
        @NotBlank String titleMn,
        String titleEn,
        String supervisorId,
        String description
) {
}