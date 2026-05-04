package mn.num.edu.workflow_service.adapters.out.kafka;

import lombok.extern.slf4j.Slf4j;
import mn.num.edu.workflow_service.application.port.out.WorkflowEventPublisherPort;
import mn.num.edu.workflow_service.domain.event.*;
import org.springframework.kafka.core.KafkaTemplate;

@Slf4j
public class WorkflowKafkaProducer implements WorkflowEventPublisherPort {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public WorkflowKafkaProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public void publishWorkflowCreated(WorkflowCreatedEvent event) {
        kafkaTemplate.send("workflow.created", event);
    }

    @Override
    public void publishWorkflowStageCreated(WorkflowStageCreatedEvent event) {
        kafkaTemplate.send("workflow.stage.created", event);
    }

    @Override
    public void publishWorkflowStageActivated(WorkflowStageActivatedEvent event) {
        kafkaTemplate.send("workflow.stage.activated", event);
        log.info("workflow.stage.activated event");
    }

    @Override
    public void publishWorkflowStageClosed(WorkflowStageClosedEvent event) {
        kafkaTemplate.send("workflow.stage.closed", event);
    }

    @Override
    public void publishWorkflowDeadlineApproaching(WorkflowDeadlineApproachingEvent event) {
        kafkaTemplate.send("workflow.deadline.approaching", event);
    }

    @Override
    public void publishWorkflowCompleted(WorkflowCompletedEvent event) {
        kafkaTemplate.send("workflow.completed", event);
    }
}