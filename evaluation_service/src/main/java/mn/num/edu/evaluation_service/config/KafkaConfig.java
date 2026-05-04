package mn.num.edu.evaluation_service.config;

import mn.num.edu.evaluation_service.domain.event.WorkflowStageActivatedEvent;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        props.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false);
        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    @Bean
    public ConsumerFactory<String, WorkflowStageActivatedEvent> workflowStageActivatedConsumerFactory() {
        JsonDeserializer<WorkflowStageActivatedEvent> deserializer =
                new JsonDeserializer<>(WorkflowStageActivatedEvent.class);
        deserializer.addTrustedPackages("*");
        deserializer.setUseTypeHeaders(false);

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "evaluation-service-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);

        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, WorkflowStageActivatedEvent>
    workflowStageActivatedKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, WorkflowStageActivatedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(workflowStageActivatedConsumerFactory());
        return factory;
    }

    @Bean
    public NewTopic workflowStageActivatedTopic() {
        return new NewTopic("workflow.stage.activated", 1, (short) 1);
    }

    @Bean
    public NewTopic evaluationSubmittedTopic() {
        return new NewTopic("evaluation.submitted", 1, (short) 1);
    }

    @Bean
    public NewTopic evaluationUpdatedTopic() {
        return new NewTopic("evaluation.updated", 1, (short) 1);
    }

    @Bean
    public NewTopic evaluationCompletedTopic() {
        return new NewTopic("evaluation.completed", 1, (short) 1);
    }
}