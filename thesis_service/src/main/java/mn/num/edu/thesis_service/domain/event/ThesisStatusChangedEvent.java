package mn.num.edu.thesis_service.domain.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record ThesisStatusChangedEvent(
        String thesisId,
        String studentId,
        String oldStatus,
        String newStatus,
        LocalDateTime occurredAt
) {
}