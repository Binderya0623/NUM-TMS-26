package mn.num.edu.user_service.domain.event;

import lombok.extern.slf4j.Slf4j;
import mn.num.edu.user_service.domain.model.User;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class UserEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public UserEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishUserCreated(User user) {
        UserCreatedEvent event =
                new UserCreatedEvent(user.getId(), user.getSystemRole().name());

        kafkaTemplate.send("user-created", user.getId(), event);
        log.info("Published user-created event for userId={}", user.getId());
    }
}