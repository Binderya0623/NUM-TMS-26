package mn.num.edu.notification_service.domain.event;

import java.time.LocalDateTime;
public record ThesisApprovedEvent(
        String thesisId,
        String studentId,
        String thesisTitle,
        LocalDateTime occurredAt
) {}
