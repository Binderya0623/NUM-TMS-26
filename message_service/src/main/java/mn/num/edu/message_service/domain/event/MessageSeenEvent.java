package mn.num.edu.message_service.domain.event;

import java.time.Instant;

public record MessageSeenEvent(
        String conversationId,
        String seenByUserId,
        Instant seenAt
) {}