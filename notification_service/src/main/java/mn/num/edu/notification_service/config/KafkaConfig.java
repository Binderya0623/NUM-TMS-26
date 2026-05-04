package mn.num.edu.notification_service.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
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
        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        JsonDeserializer<Object> deserializer = new JsonDeserializer<>();
        deserializer.addTrustedPackages("mn.num.edu.notification_service.domain.event");

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "notification-service-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), deserializer);
    }

    @Bean
    public NewTopic thesisApprovedTopic() {
        return TopicBuilder.name("thesis-approved").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic committeeAssignedTopic() {
        return TopicBuilder.name("committee-assigned").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic reportSubmittedTopic() {
        return TopicBuilder.name("report-submitted").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic feedbackAddedTopic() {
        return TopicBuilder.name("feedback-added").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic evaluationCompletedTopic() {
        return TopicBuilder.name("evaluation-completed").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic finalGradeCalculatedTopic() {
        return TopicBuilder.name("final-grade-calculated").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic workflowDeadlineSetTopic() {
        return TopicBuilder.name("workflow-deadline-set").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic notificationSentTopic() {
        return TopicBuilder.name("notification-sent").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic notificationFailedTopic() {
        return TopicBuilder.name("notification-failed").partitions(1).replicas(1).build();
    }
}
