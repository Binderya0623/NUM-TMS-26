package com.tms.thesissystem.infrastructure.events;

import com.tms.thesissystem.application.event.WorkflowEvent;
import com.tms.thesissystem.application.port.WorkflowEventPublisher;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.messaging.rabbit.enabled", havingValue = "false", matchIfMissing = true)
public class LocalWorkflowEventPublisher implements WorkflowEventPublisher {
    private final ApplicationEventPublisher applicationEventPublisher;

    public LocalWorkflowEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        this.applicationEventPublisher = applicationEventPublisher;
    }

    @Override
    public void publish(WorkflowEvent event) {
        applicationEventPublisher.publishEvent(event);
    }
}
