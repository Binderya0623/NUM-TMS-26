package mn.num.edu.grading_service.adapter.out.persistence;

import mn.num.edu.grading_service.application.port.out.ResolutionRepositoryPort;
import mn.num.edu.grading_service.domain.model.Resolution;
import mn.num.edu.grading_service.domain.model.ResolutionStudentResult;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class ResolutionPersistenceAdapter implements ResolutionRepositoryPort {

    private final SpringDataResolutionRepository resolutionRepository;
    private final SpringDataGradeRepository resultRepository;

    public ResolutionPersistenceAdapter(SpringDataResolutionRepository resolutionRepository,
                                        SpringDataGradeRepository resultRepository) {
        this.resolutionRepository = resolutionRepository;
        this.resultRepository = resultRepository;
    }

    @Override
    public Mono<Resolution> save(Resolution resolution) {
        ResolutionEntity entity = new ResolutionEntity(
                resolution.getId(),
                resolution.getWorkflowId(),
                resolution.getResolutionNumber(),
                resolution.getTotalStudents(),
                resolution.getPassedCount(),
                resolution.getFailedCount(),
                resolution.getGeneratedAt()
        );

        return resolutionRepository.save(entity)
                .flatMap(saved ->
                        Flux.fromIterable(resolution.getStudentResults())
                                .flatMap(result -> resultRepository.save(
                                        new GradeEntity(
                                                UUID.randomUUID().toString(),
                                                result.getThesisId(),
                                                result.getStudentId(),
                                                saved.getWorkflowId(),
                                                saved.getId(),
                                                result.getTotalScore(),
                                                result.getStatus(),
                                                saved.getGeneratedAt()
                                        )
                                ))
                                .then(Mono.just(new Resolution(
                                        saved.getId(),
                                        saved.getWorkflowId(),
                                        saved.getResolutionNumber(),
                                        saved.getTotalStudents(),
                                        saved.getPassedCount(),
                                        saved.getFailedCount(),
                                        saved.getGeneratedAt(),
                                        resolution.getStudentResults()
                                )))
                );
    }

    @Override
    public Mono<Resolution> findByWorkflowId(String workflowId) {
        return resolutionRepository.findByWorkflowId(workflowId)
                .next()
                .flatMap(resolutionEntity ->
                        resultRepository.findByResolutionId(resolutionEntity.getId())
                                .map(result -> new ResolutionStudentResult(
                                        result.getStudentId(),
                                        result.getThesisId(),
                                        result.getTotalScore(),
                                        result.getStatus()
                                ))
                                .collectList()
                                .map(results -> new Resolution(
                                        resolutionEntity.getId(),
                                        resolutionEntity.getWorkflowId(),
                                        resolutionEntity.getResolutionNumber(),
                                        resolutionEntity.getTotalStudents(),
                                        resolutionEntity.getPassedCount(),
                                        resolutionEntity.getFailedCount(),
                                        resolutionEntity.getGeneratedAt(),
                                        results
                                ))
                );
    }
}