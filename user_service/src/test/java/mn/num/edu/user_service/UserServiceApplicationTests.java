package mn.num.edu.user_service;

import mn.num.edu.user_service.domain.event.UserCreatedEvent;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import reactor.kafka.sender.KafkaSender;
import org.springframework.boot.test.mock.mockito.MockBean;
@SpringBootTest
class UserServiceApplicationTests {

	@MockBean
	private mn.num.edu.user_service.application.port.out.UserEventPublisherPort userEventPublisherPort;

	@Test
	void contextLoads() {
	}

}
