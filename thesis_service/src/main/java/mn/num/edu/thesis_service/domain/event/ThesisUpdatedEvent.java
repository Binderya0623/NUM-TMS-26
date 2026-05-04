package mn.num.edu.thesis_service.domain.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record ThesisUpdatedEvent(
        String thesisId,
        String studentId,
        String titleMn,
        String titleEn,
        String description,
        LocalDateTime occurredAt
) {
}