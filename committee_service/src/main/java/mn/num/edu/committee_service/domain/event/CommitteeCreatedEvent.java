package mn.num.edu.committee_service.domain.event;

import java.time.Instant;

public record CommitteeCreatedEvent(
        String committeeId,
        String departmentId,
        String committeeName,
        String defenseType,
        Instant createdAt
) {}