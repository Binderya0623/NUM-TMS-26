package mn.num.edu.thesis_service.domain.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record ThesisRejectedEvent(
        String thesisId,
        String studentId,
        LocalDateTime occurredAt
) {
}