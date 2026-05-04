package mn.num.edu.grading_service.domain.event;

import java.time.LocalDateTime;


public record ResolutionGeneratedEvent (
      String resolutionId ,
      String workflowId ,
      int totalStudents ,
      int passedCount ,
      int failedCount ,
      LocalDateTime occurredAt

   ){}