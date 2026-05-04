package mn.num.edu.grading_service.adapter.in.kafka;

import mn.num.edu.grading_service.application.port.in.CalculateFinalGradeUseCase;
import mn.num.edu.grading_service.application.port.in.GenerateResolutionUseCase;
import mn.num.edu.grading_service.domain.event.EvaluationCompletedEvent;
import mn.num.edu.grading_service.domain.event.WorkflowCompletedEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class GradingKafkaConsumer {

    private final CalculateFinalGradeUseCase calculateFinalGradeUseCase;
    private final GenerateResolutionUseCase generateResolutionUseCase;

    public GradingKafkaConsumer(CalculateFinalGradeUseCase calculateFinalGradeUseCase,
                                GenerateResolutionUseCase generateResolutionUseCase) {
        this.calculateFinalGradeUseCase = calculateFinalGradeUseCase;
        this.generateResolutionUseCase = generateResolutionUseCase;
    }

    @KafkaListener(topics = "evaluation-completed", groupId = "grading-service-group")
    public void consumeEvaluationCompleted(EvaluationCompletedEvent event) {
        calculateFinalGradeUseCase
                .calculateForThesis(event.thesisId(), event.studentId(), event.workflowId(), event.totalScore())
                .subscribe();
    }

    @KafkaListener(topics = "workflow-completed", groupId = "grading-service-group")
    public void consumeWorkflowCompleted(WorkflowCompletedEvent event) {
        generateResolutionUseCase.generate(event.workflowId()).subscribe();
    }
}
