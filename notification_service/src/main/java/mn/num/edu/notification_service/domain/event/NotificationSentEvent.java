package mn.num.edu.notification_service.domain.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationSentEvent(
        UUID notificationId,
        UUID userId,
        String title,
        LocalDateTime sentAt
) {}
