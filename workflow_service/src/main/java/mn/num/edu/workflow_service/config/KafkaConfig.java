package mn.num.edu.workflow_service.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        config.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false);
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "workflow-service");
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);

        return new DefaultKafkaConsumerFactory<>(config);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }

    @Bean
    public NewTopic workflowCreatedTopic() {
        return new NewTopic("workflow-created", 1, (short) 1);
    }

    @Bean
    public NewTopic workflowStageCreatedTopic() {
        return new NewTopic("workflow-stage-created", 1, (short) 1);
    }

    @Bean
    public NewTopic workflowStageActivatedTopic() {
        return new NewTopic("workflow-stage-activated", 1, (short) 1);
    }

    @Bean
    public NewTopic workflowStageClosedTopic() {
        return new NewTopic("workflow-stage-closed", 1, (short) 1);
    }

    @Bean
    public NewTopic workflowCompletedTopic() {
        return new NewTopic("workflow-completed", 1, (short) 1);
    }

    @Bean
    public NewTopic thesisApprovedTopic() {
        return new NewTopic("thesis-approved", 1, (short) 1);
    }

    @Bean
    public NewTopic committeeCreatedTopic() {
        return new NewTopic("committee-created", 1, (short) 1);
    }

    @Bean
    public NewTopic reportSubmittedTopic() {
        return new NewTopic("report-submitted", 1, (short) 1);
    }

    @Bean
    public NewTopic evaluationSubmittedTopic() {
        return new NewTopic("evaluation-submitted", 1, (short) 1);
    }
}