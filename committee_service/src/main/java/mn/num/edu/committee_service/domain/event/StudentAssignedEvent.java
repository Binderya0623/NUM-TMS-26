package mn.num.edu.committee_service.domain.event;

import java.time.Instant;
import java.util.UUID;

public record StudentAssignedEvent(
        String committeeId,
        String studentId,
        String departmentId,
        Instant assignedAt
) {}
