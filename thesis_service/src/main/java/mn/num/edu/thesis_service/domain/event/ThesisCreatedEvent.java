package mn.num.edu.thesis_service.domain.event;


import java.time.LocalDateTime;
import java.util.UUID;

public record ThesisCreatedEvent(
        String thesisId,
        String studentId,
        String titleMn,
        String titleEn,
        String status,
        String supervisorId,
        LocalDateTime occurredAt
) {
}