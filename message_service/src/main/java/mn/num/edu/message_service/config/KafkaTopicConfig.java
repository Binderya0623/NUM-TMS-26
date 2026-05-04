package mn.num.edu.message_service.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic messageSentTopic() {
        return new NewTopic("message-sent", 3, (short) 1);
    }

    @Bean
    public NewTopic messageSeenTopic() {
        return new NewTopic("message-seen", 3, (short) 1);
    }
}