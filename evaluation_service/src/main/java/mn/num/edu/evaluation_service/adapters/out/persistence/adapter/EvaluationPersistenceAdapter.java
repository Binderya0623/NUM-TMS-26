package mn.num.edu.evaluation_service.adapters.out.persistence.adapter;

import mn.num.edu.evaluation_service.adapters.out.persistence.entity.CriterionAssessmentEntity;
import mn.num.edu.evaluation_service.adapters.out.persistence.entity.EvaluationEntity;
import mn.num.edu.evaluation_service.adapters.out.persistence.repository.SpringDataCriterionAssessmentRepository;
import mn.num.edu.evaluation_service.adapters.out.persistence.repository.SpringDataEvaluationRepository;
import mn.num.edu.evaluation_service.application.port.out.EvaluationRepositoryPort;
import mn.num.edu.evaluation_service.domain.model.CriterionAssessment;
import mn.num.edu.evaluation_service.domain.model.Evaluation;
import mn.num.edu.evaluation_service.domain.model.EvaluationStatus;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class EvaluationPersistenceAdapter implements EvaluationRepositoryPort {

    private final SpringDataEvaluationRepository evaluationRepository;
    private final SpringDataCriterionAssessmentRepository criterionRepository;

    public EvaluationPersistenceAdapter(
            SpringDataEvaluationRepository evaluationRepository,
            SpringDataCriterionAssessmentRepository criterionRepository
    ) {
        this.evaluationRepository = evaluationRepository;
        this.criterionRepository = criterionRepository;
    }

    @Override
    public Mono<Evaluation> save(Evaluation evaluation) {
        EvaluationEntity entity = new EvaluationEntity(
                evaluation.getId(),
                evaluation.getThesisId(),
                evaluation.getWorkflowId(),
                evaluation.getStageId(),
                evaluation.getStageName(),
                evaluation.getStageMaxPoint(),
                evaluation.getCommitteeId(),
                evaluation.getEvaluatorId(),
                evaluation.getStatus().name()
        );

        return evaluationRepository.save(entity)
                .flatMap(saved ->
                        criterionRepository.deleteByEvaluationId(saved.getId())
                                .thenMany(reactor.core.publisher.Flux.fromIterable(evaluation.getCriteria()))
                                .flatMap(c -> criterionRepository.save(new CriterionAssessmentEntity(
                                        UUID.randomUUID(),
                                        saved.getId(),
                                        c.getCriterionId(),
                                        c.getCriterionName(),
                                        c.getMaxPoint(),
                                        c.getAchievedPercent(),
                                        c.getWeightedScore()
                                )))
                                .then(Mono.just(evaluation))
                );
    }

    @Override
    public Mono<Evaluation> findById(UUID evaluationId) {
        return evaluationRepository.findById(evaluationId)
                .flatMap(entity ->
                        criterionRepository.findByEvaluationId(entity.getId())
                                .collectList()
                                .map(criteria -> {
                                    Evaluation evaluation = new Evaluation(
                                            entity.getId(),
                                            entity.getThesisId(),
                                            entity.getWorkflowId(),
                                            entity.getStageId(),
                                            entity.getStageName(),
                                            entity.getStageMaxPoint(),
                                            entity.getCommitteeId(),
                                            entity.getEvaluatorId(),
                                            EvaluationStatus.valueOf(entity.getStatus())
                                    );

                                    criteria.forEach(c -> evaluation.addCriterion(
                                            new CriterionAssessment(
                                                    c.getCriterionId(),
                                                    c.getCriterionName(),
                                                    c.getMaxPoint(),
                                                    c.getAchievedPercent()
                                            )
                                    ));
                                    return evaluation;
                                })
                );
    }
}