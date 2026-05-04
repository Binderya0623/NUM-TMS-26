package mn.num.edu.committee_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
@SpringBootTest
class CommitteeServiceApplicationTests {

	@MockBean
	private mn.num.edu.committee_service.application.port.out.CommitteeEventPublisherPort committeeEventPublisherPort;

	@Test
	void contextLoads() {
	}

}
