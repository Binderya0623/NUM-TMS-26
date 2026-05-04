package mn.num.edu.thesis_service.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ThesisResponse(
        String id,
        String studentId,
        String supervisorId,
        String committeeId,
        String titleMn,
        String titleEn,
        String description,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}