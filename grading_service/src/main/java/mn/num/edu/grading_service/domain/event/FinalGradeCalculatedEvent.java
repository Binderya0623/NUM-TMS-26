package mn.num.edu.grading_service.domain.event;

import mn.num.edu.grading_service.domain.model.GradeStatus;

import java.time.LocalDateTime;

public record FinalGradeCalculatedEvent (
      String thesisId,
      String studentId,
      String workflowId,
      Double totalScore,
      GradeStatus status,
      LocalDateTime occurredAt
    ){
}