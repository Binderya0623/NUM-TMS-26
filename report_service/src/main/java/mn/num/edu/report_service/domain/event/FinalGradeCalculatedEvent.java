package mn.num.edu.report_service.domain.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FinalGradeCalculatedEvent(
        String thesisId,
        String studentId,
        String workflowId,
        Double totalScore,
        Object status,
        Object calculatedAt
) {}
