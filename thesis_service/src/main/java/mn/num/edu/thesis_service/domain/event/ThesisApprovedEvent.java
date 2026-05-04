package mn.num.edu.thesis_service.domain.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record ThesisApprovedEvent(
        String thesisId,
        String studentId,
        LocalDateTime occurredAt
) {
}