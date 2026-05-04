package mn.num.edu.committee_service.domain.event;

import mn.num.edu.committee_service.domain.model.CommitteeRole;

import java.time.Instant;
import java.util.UUID;

public record TeacherAssignedEvent(
        String committeeId,
        String teacherId,
        CommitteeRole role,
        String departmentId,
        Instant assignedAt
) {}
