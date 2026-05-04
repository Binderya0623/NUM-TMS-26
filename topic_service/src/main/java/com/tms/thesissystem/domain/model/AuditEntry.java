package com.tms.thesissystem.domain.model;

import java.time.LocalDateTime;

public record AuditEntry(
        Long id,
        String entityType,
        Long entityId,
        String action,
        String actorName,
        String detail,
        LocalDateTime createdAt
) {
}
