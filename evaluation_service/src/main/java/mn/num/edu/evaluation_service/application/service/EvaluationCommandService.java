package mn.num.edu.evaluation_service.application.service;

import mn.num.edu.evaluation_service.application.dto.SubmitEvaluationCommand;
import mn.num.edu.evaluation_service.application.dto.UpdateEvaluationCommand;
import mn.num.edu.evaluation_service.application.port.in.SubmitEvaluationUseCase;
import mn.num.edu.evaluation_service.application.port.in.UpdateEvaluationUseCase;
import mn.num.edu.evaluation_service.application.port.out.EvaluationEventPublisherPort;
import mn.num.edu.evaluation_service.application.port.out.EvaluationRepositoryPort;
import mn.num.edu.evaluation_service.domain.event.EvaluationSubmittedEvent;
import mn.num.edu.evaluation_service.domain.event.EvaluationUpdatedEvent;
import mn.num.edu.evaluation_service.domain.model.CriterionAssessment;
import mn.num.edu.evaluation_service.domain.model.Evaluation;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@Service
public class EvaluationCommandService implements SubmitEvaluationUseCase, UpdateEvaluationUseCase {

    private final EvaluationRepositoryPort repositoryPort;
    private final EvaluationEventPublisherPort publisherPort;

    public EvaluationCommandService(
            EvaluationRepositoryPort repositoryPort,
            EvaluationEventPublisherPort publisherPort
    ) {
        this.repositoryPort = repositoryPort;
        this.publisherPort = publisherPort;
    }

    @Override
    public Mono<Void> submit(SubmitEvaluationCommand command) {
        return repositoryPort.findById(command.evaluationId())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Evaluation not found")))
                .flatMap(evaluation -> applySubmitScores(evaluation, command.criteria()))
                .flatMap(evaluation -> {
                    evaluation.submit();
                    return repositoryPort.save(evaluation);
                })
                .flatMap(saved -> publisherPort.publishSubmitted(
                        new EvaluationSubmittedEvent(
                                saved.getId(),
                                saved.getThesisId(),
                                saved.getStageId(),
                                saved.getEvaluatorId(),
                                saved.totalWeightedScore()
                        )
                ))
                .then();
    }

    @Override
    public Mono<Void> update(UpdateEvaluationCommand command) {
        return repositoryPort.findById(command.evaluationId())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Evaluation not found")))
                .flatMap(evaluation -> applyUpdateScores(evaluation, command.criteria()))
                .flatMap(repositoryPort::save)
                .flatMap(saved -> publisherPort.publishUpdated(
                        new EvaluationUpdatedEvent(
                                saved.getId(),
                                saved.getThesisId(),
                                saved.getStageId(),
                                saved.totalWeightedScore()
                        )
                ))
                .then();
    }

    private Mono<Evaluation> applySubmitScores(
            Evaluation evaluation,
            List<SubmitEvaluationCommand.CriterionInput> incomingCriteria
    ) {
        for (SubmitEvaluationCommand.CriterionInput input : incomingCriteria) {
            updateCriterion(evaluation, input.criterionId(), input.achievedPercent());
        }
        return Mono.just(evaluation);
    }

    private Mono<Evaluation> applyUpdateScores(
            Evaluation evaluation,
            List<UpdateEvaluationCommand.CriterionInput> incomingCriteria
    ) {
        for (UpdateEvaluationCommand.CriterionInput input : incomingCriteria) {
            updateCriterion(evaluation, input.criterionId(), input.achievedPercent());
        }
        return Mono.just(evaluation);
    }

    private void updateCriterion(Evaluation evaluation, UUID criterionId, Integer percent) {
        CriterionAssessment target = evaluation.getCriteria().stream()
                .filter(c -> c.getCriterionId().equals(criterionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Criterion not found: " + criterionId));

        target.updatePercent(percent);
    }
}