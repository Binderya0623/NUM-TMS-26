package mn.num.edu.thesis_service.domain.event;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record CommitteeAssignedEvent(
        String committeeId,
        String studentId,
        String departmentId,
        Instant assignedAt
) {
}