package mn.num.edu.analytic_service.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.config.TopicBuilder;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "analytic-service-group");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }

    @Bean public NewTopic thesisApprovedTopic()        { return TopicBuilder.name("thesis-approved").partitions(1).replicas(1).build(); }
    @Bean public NewTopic finalGradeCalculatedTopic()  { return TopicBuilder.name("final-grade-calculated").partitions(1).replicas(1).build(); }
    @Bean public NewTopic evaluationCompletedTopic()   { return TopicBuilder.name("evaluation-completed").partitions(1).replicas(1).build(); }
    @Bean public NewTopic workflowCompletedTopic()     { return TopicBuilder.name("workflow-completed").partitions(1).replicas(1).build(); }
    @Bean public NewTopic reportSubmittedTopic()       { return TopicBuilder.name("report-submitted").partitions(1).replicas(1).build(); }
}
