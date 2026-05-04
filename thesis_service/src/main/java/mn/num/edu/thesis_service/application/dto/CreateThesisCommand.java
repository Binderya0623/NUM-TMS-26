package mn.num.edu.thesis_service.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateThesisCommand(
        @NotNull String studentId,
        @NotBlank String titleMn,
        String supervisorId,
        String committeeId,
        String titleEn,
        String description
) {
}