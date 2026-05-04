package mn.num.edu.report_service.config;

import mn.num.edu.report_service.application.port.out.AcademicReportRepositoryPort;
import mn.num.edu.report_service.application.service.ReportApplicationService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BeanConfig {

    @Bean
    public ReportApplicationService reportApplicationService(AcademicReportRepositoryPort repo) {
        return new ReportApplicationService(repo);
    }
}
