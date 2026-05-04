package mn.num.edu.notification_service.domain.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationFailedEvent(
        UUID notificationId,
        UUID userId,
        String reason,
        LocalDateTime failedAt
) {}