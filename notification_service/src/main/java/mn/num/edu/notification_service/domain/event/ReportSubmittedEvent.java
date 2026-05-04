package mn.num.edu.notification_service.domain.event;


import java.time.LocalDateTime;

public record ReportSubmittedEvent(
        String reportId,
        String studentId,
        String reportType,
        LocalDateTime submittedAt
) {}
