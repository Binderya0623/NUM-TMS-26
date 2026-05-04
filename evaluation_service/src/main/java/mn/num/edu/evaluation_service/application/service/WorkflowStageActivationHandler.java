package mn.num.edu.evaluation_service.application.service;

import mn.num.edu.evaluation_service.domain.event.WorkflowStageActivatedEvent;
import mn.num.edu.evaluation_service.application.port.out.EvaluationRepositoryPort;
import mn.num.edu.evaluation_service.domain.model.CriterionAssessment;
import mn.num.edu.evaluation_service.domain.model.Evaluation;
import mn.num.edu.evaluation_service.domain.model.EvaluationStatus;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
public class WorkflowStageActivationHandler {

    private final EvaluationRepositoryPort evaluationRepositoryPort;

    public WorkflowStageActivationHandler(EvaluationRepositoryPort evaluationRepositoryPort) {
        this.evaluationRepositoryPort = evaluationRepositoryPort;
    }

    public Mono<Void> handle(WorkflowStageActivatedEvent event) {
        Evaluation evaluation = new Evaluation(
                UUID.randomUUID(),
                event.thesisId(),
                event.workflowId(),
                event.stageId(),
                event.stageName(),
                event.stageMaxPoint(),
                null,
                null,
                EvaluationStatus.PENDING
        );

        event.criteria().forEach(c ->
                evaluation.addCriterion(
                        new CriterionAssessment(
                                c.criterionId(),
                                c.name(),
                                c.maxPoint(),
                                0
                        )
                )
        );

        return evaluationRepositoryPort.save(evaluation).then();
    }
}