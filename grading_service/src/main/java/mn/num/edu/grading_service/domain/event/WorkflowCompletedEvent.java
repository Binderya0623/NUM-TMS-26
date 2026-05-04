package mn.num.edu.grading_service.domain.event;

import java.time.LocalDateTime;

public record WorkflowCompletedEvent (
     String workflowId,
     String workflowName,
     LocalDateTime occurredAt
    ){
}