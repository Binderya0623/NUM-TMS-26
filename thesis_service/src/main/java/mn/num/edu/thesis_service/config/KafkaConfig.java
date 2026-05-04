package mn.num.edu.thesis_service.config;

import mn.num.edu.thesis_service.domain.event.CommitteeAssignedEvent;
import mn.num.edu.thesis_service.domain.event.StudentRegisteredEvent;
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

    private <T> ConsumerFactory<String, T> consumerFactory(Class<T> clazz, String groupId) {
        JsonDeserializer<T> deserializer = new JsonDeserializer<>(clazz);
        deserializer.addTrustedPackages("*");
        deserializer.setUseTypeHeaders(false);

        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        config.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);

        return new DefaultKafkaConsumerFactory<>(config, new StringDeserializer(), deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, StudentRegisteredEvent>
    studentRegisteredKafkaListenerContainerFactory() {
        var factory = new ConcurrentKafkaListenerContainerFactory<String, StudentRegisteredEvent>();
        factory.setConsumerFactory(consumerFactory(StudentRegisteredEvent.class, "thesis-service-group"));
        return factory;
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, CommitteeAssignedEvent>
    committeeAssignedKafkaListenerContainerFactory() {
        var factory = new ConcurrentKafkaListenerContainerFactory<String, CommitteeAssignedEvent>();
        factory.setConsumerFactory(consumerFactory(CommitteeAssignedEvent.class, "thesis-service-group"));
        return factory;
    }

    @Bean
    public NewTopic thesisCreatedTopic() {
        return new NewTopic("thesis-created", 1, (short) 1);
    }

    @Bean
    public NewTopic thesisUpdatedTopic() {
        return new NewTopic("thesis-updated", 1, (short) 1);
    }

    @Bean
    public NewTopic thesisApprovedTopic() {
        return new NewTopic("thesis-approved", 1, (short) 1);
    }

    @Bean
    public NewTopic thesisRejectedTopic() {
        return new NewTopic("thesis-rejected", 1, (short) 1);
    }

    @Bean
    public NewTopic thesisStatusChangedTopic() {
        return new NewTopic("thesis-status-changed", 1, (short) 1);
    }

    @Bean
    public NewTopic studentRegisteredTopic() {
        return new NewTopic("student-registered", 1, (short) 1);
    }

    @Bean
    public NewTopic committeeAssignedTopic() {
        return new NewTopic("committee-assigned", 1, (short) 1);
    }
}