package com.tms.thesissystem.infrastructure.events;

import com.tms.thesissystem.application.event.WorkflowEvent;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.messaging.rabbit.enabled", havingValue = "false", matchIfMissing = true)
public class WorkflowNotificationListener {
    private final WorkflowEventProjectionService projectionService;

    public WorkflowNotificationListener(WorkflowEventProjectionService projectionService) {
        this.projectionService = projectionService;
    }

    @EventListener
    public void onWorkflowEvent(WorkflowEvent event) {
        projectionService.storeNotifications(event);
    }
}
