package mn.num.edu.notification_service.domain.event;

import java.time.Instant;

public record CommitteeAssignedEvent(
        String committeeId,
        String teacherId,
        String studentId,
        String departmentId,
        String committeeName,
        String role,
        Instant assignedAt
) {}
