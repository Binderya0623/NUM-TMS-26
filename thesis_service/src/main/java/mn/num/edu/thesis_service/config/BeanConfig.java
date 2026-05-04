package mn.num.edu.thesis_service.config;

import mn.num.edu.thesis_service.application.port.out.ThesisEventPublisherPort;
import mn.num.edu.thesis_service.application.port.out.ThesisRepositoryPort;
import mn.num.edu.thesis_service.application.service.ThesisApplicationService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BeanConfig {

    @Bean
    public ThesisApplicationService thesisApplicationService(
            ThesisRepositoryPort thesisRepositoryPort,
            ThesisEventPublisherPort thesisEventPublisherPort
    ) {
        return new ThesisApplicationService(thesisRepositoryPort, thesisEventPublisherPort);
    }
}