package mn.num.edu.workflow_service.config;

import mn.num.edu.workflow_service.adapters.out.kafka.WorkflowKafkaProducer;
import mn.num.edu.workflow_service.adapters.out.persistence.repository.SpringDataWorkflowRepository;
import mn.num.edu.workflow_service.adapters.out.persistence.repository.SpringDataWorkflowStageRepository;
import mn.num.edu.workflow_service.adapters.out.persistence.adapter.WorkflowPersistenceAdapter;
import mn.num.edu.workflow_service.application.service.WorkflowApplicationService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;

@Configuration
public class BeanConfig {

    @Bean
    public WorkflowPersistenceAdapter workflowPersistenceAdapter(
            SpringDataWorkflowRepository workflowRepository,
            SpringDataWorkflowStageRepository stageRepository
    ) {
        return new WorkflowPersistenceAdapter(workflowRepository, stageRepository);
    }

    @Bean
    public WorkflowKafkaProducer workflowKafkaProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        return new WorkflowKafkaProducer(kafkaTemplate);
    }

    @Bean
    public WorkflowApplicationService workflowApplicationService(
            WorkflowPersistenceAdapter persistenceAdapter,
            WorkflowKafkaProducer producer
    ) {
        return new WorkflowApplicationService(
                persistenceAdapter,
                persistenceAdapter,
                producer
        );
    }
}
