package com.tms.thesissystem.infrastructure.events;

import com.tms.thesissystem.application.event.WorkflowEvent;
import com.tms.thesissystem.application.port.WorkflowEventPublisher;
import com.tms.thesissystem.config.RabbitMqConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.messaging.rabbit.enabled", havingValue = "true")
public class RabbitWorkflowEventPublisher implements WorkflowEventPublisher {
    private final RabbitTemplate rabbitTemplate;
    private final String exchangeName;

    public RabbitWorkflowEventPublisher(RabbitTemplate rabbitTemplate,
                                        @Value("${app.messaging.rabbit.exchange:" + RabbitMqConfig.WORKFLOW_EXCHANGE + "}") String exchangeName) {
        this.rabbitTemplate = rabbitTemplate;
        this.exchangeName = exchangeName;
    }

    @Override
    public void publish(WorkflowEvent event) {
        rabbitTemplate.convertAndSend(exchangeName, "", event);
    }
}
