package mn.num.edu.analytic_service.config;

import mn.num.edu.analytic_service.application.port.out.AnalyticsRepositoryPort;
import mn.num.edu.analytic_service.application.service.AnalyticsApplicationService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BeanConfig {

    @Bean
    public AnalyticsApplicationService analyticsApplicationService(AnalyticsRepositoryPort repository) {
        return new AnalyticsApplicationService(repository);
    }
}
