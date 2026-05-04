package mn.num.edu.grading_service.config;


import mn.num.edu.grading_service.application.port.in.CalculateFinalGradeUseCase;
import mn.num.edu.grading_service.application.port.in.GenerateResolutionUseCase;
import mn.num.edu.grading_service.application.port.out.*;
import mn.num.edu.grading_service.application.service.CalculateFinalGradeService;
import mn.num.edu.grading_service.application.service.GenerateResolutionService;
import mn.num.edu.grading_service.domain.service.GradeDomainService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BeanConfig {

    @Bean
    public GradeDomainService gradeDomainService() {
        return new GradeDomainService(60.0);
    }

    @Bean
    public CalculateFinalGradeUseCase calculateFinalGradeUseCase(
            GradeRepositoryPort gradeRepositoryPort,
            EventPublisherPort eventPublisherPort,
            GradeDomainService gradeDomainService) {
        return new CalculateFinalGradeService(
                gradeRepositoryPort,
                eventPublisherPort,
                gradeDomainService
        );
    }

    @Bean
    public GenerateResolutionUseCase generateResolutionUseCase(
            GradeRepositoryPort gradeRepositoryPort,
            ResolutionRepositoryPort resolutionRepositoryPort,
            EventPublisherPort eventPublisherPort) {
        return new GenerateResolutionService(
                gradeRepositoryPort,
                resolutionRepositoryPort,
                eventPublisherPort
        );
    }
}