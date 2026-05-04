package com.tms.thesissystem.application.event;

import java.time.LocalDateTime;
import java.util.List;

public record WorkflowEvent(
        String entityType,
        Long entityId,
        String action,
        String actorName,
        String detail,
        String notificationTitle,
        String notificationMessage,
        List<Long> recipientIds,
        LocalDateTime occurredAt
) {
}
