package com.tms.thesissystem.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
@ConditionalOnProperty(name = "app.messaging.rabbit.enabled", havingValue = "true")
public class RabbitMqConfig {
    public static final String WORKFLOW_EXCHANGE = "thesis.workflow.exchange";
    public static final String NOTIFICATION_QUEUE = "thesis.workflow.notifications";
    public static final String AUDIT_QUEUE = "thesis.workflow.audit";

    @Bean
    FanoutExchange workflowExchange() {
        return new FanoutExchange(WORKFLOW_EXCHANGE, true, false);
    }

    @Bean
    Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true);
    }

    @Bean
    Queue auditQueue() {
        return new Queue(AUDIT_QUEUE, true);
    }

    @Bean
    Binding notificationBinding(FanoutExchange workflowExchange, Queue notificationQueue) {
        return BindingBuilder.bind(notificationQueue).to(workflowExchange);
    }

    @Bean
    Binding auditBinding(FanoutExchange workflowExchange, Queue auditQueue) {
        return BindingBuilder.bind(auditQueue).to(workflowExchange);
    }

    @Bean
    JacksonJsonMessageConverter jacksonJsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, JacksonJsonMessageConverter converter,
                                  @Value("${app.messaging.rabbit.exchange:" + WORKFLOW_EXCHANGE + "}") String exchangeName) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter);
        rabbitTemplate.setExchange(exchangeName);
        return rabbitTemplate;
    }
}
