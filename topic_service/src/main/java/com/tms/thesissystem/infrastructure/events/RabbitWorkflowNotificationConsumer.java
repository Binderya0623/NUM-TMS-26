package com.tms.thesissystem.infrastructure.events;

import com.tms.thesissystem.application.event.WorkflowEvent;
import com.tms.thesissystem.config.RabbitMqConfig;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.messaging.rabbit.enabled", havingValue = "true")
public class RabbitWorkflowNotificationConsumer {
    private final WorkflowEventProjectionService projectionService;

    public RabbitWorkflowNotificationConsumer(WorkflowEventProjectionService projectionService) {
        this.projectionService = projectionService;
    }

    @RabbitListener(queues = RabbitMqConfig.NOTIFICATION_QUEUE)
    public void consume(WorkflowEvent event) {
        projectionService.storeNotifications(event);
    }
}
