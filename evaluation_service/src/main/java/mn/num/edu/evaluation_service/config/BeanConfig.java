package mn.num.edu.evaluation_service.config;

import  mn.num.edu.evaluation_service.application.port.in.SubmitEvaluationUseCase;
import  mn.num.edu.evaluation_service.application.port.in.UpdateEvaluationUseCase;
import mn.num.edu.evaluation_service.application.port.out.EvaluationEventPublisherPort;
import mn.num.edu.evaluation_service.application.port.out.EvaluationRepositoryPort;
import mn.num.edu.evaluation_service.application.service.EvaluationCommandService;
import mn.num.edu.evaluation_service.application.service.WorkflowStageActivationHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BeanConfig {

    @Bean
    public EvaluationCommandService evaluationCommandService(
            EvaluationRepositoryPort repositoryPort,
            EvaluationEventPublisherPort publisherPort
    ) {
        return new EvaluationCommandService(repositoryPort, publisherPort);
    }

    @Bean
    public SubmitEvaluationUseCase submitEvaluationUseCase(EvaluationCommandService service) {
        return service;
    }

    @Bean
    public UpdateEvaluationUseCase updateEvaluationUseCase(EvaluationCommandService service) {
        return service;
    }

    @Bean
    public WorkflowStageActivationHandler workflowStageActivationHandler(
            EvaluationRepositoryPort repositoryPort
    ) {
        return new WorkflowStageActivationHandler(repositoryPort);
    }
}