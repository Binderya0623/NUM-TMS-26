package mn.num.edu.workflow_service.application.port.out;
import mn.num.edu.workflow_service.domain.event.*;
import reactor.core.publisher.Mono;

public interface WorkflowEventPublisherPort {
    void publishWorkflowCreated(WorkflowCreatedEvent event);
    void publishWorkflowStageCreated(WorkflowStageCreatedEvent event);
    void publishWorkflowStageActivated(WorkflowStageActivatedEvent event);
    void publishWorkflowStageClosed(WorkflowStageClosedEvent event);
    void publishWorkflowDeadlineApproaching(WorkflowDeadlineApproachingEvent event);
    void publishWorkflowCompleted(WorkflowCompletedEvent event);}
