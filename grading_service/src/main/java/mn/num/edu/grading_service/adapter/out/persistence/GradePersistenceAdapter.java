package mn.num.edu.grading_service.adapter.out.persistence;

import mn.num.edu.grading_service.application.port.out.GradeRepositoryPort;
import mn.num.edu.grading_service.domain.model.Grade;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class GradePersistenceAdapter implements GradeRepositoryPort {

    private final SpringDataGradeRepository repository;

    public GradePersistenceAdapter(SpringDataGradeRepository repository) {
        this.repository = repository;
    }

    @Override
    public Mono<Grade> save(Grade grade) {
        GradeEntity entity = new GradeEntity(
                grade.getId(),
                grade.getThesisId(),
                grade.getStudentId(),
                grade.getWorkflowId(),
                grade.getResolutionId(),
                grade.getTotalScore(),
                grade.getStatus(),
                grade.getCalculatedAt()
        );

        return repository.save(entity)
                .map(saved -> new Grade(
                        saved.getId(),
                        saved.getThesisId(),
                        saved.getStudentId(),
                        saved.getWorkflowId(),
                        saved.getResolutionId(),
                        saved.getTotalScore(),
                        saved.getStatus(),
                        saved.getCalculatedAt()
                ));
    }

    @Override
    public Mono<Grade> findByThesisId( String thesisId) {
        return repository.findByThesisId(thesisId)
                .map(saved -> new Grade(
                        saved.getId(),
                        saved.getThesisId(),
                        saved.getStudentId(),
                        saved.getWorkflowId(),
                        saved.getResolutionId(),
                        saved.getTotalScore(),
                        saved.getStatus(),
                        saved.getCalculatedAt()
                ));
    }

    @Override
    public Flux<Grade> findByWorkflowId( String workflowId) {
        return repository.findByWorkflowId(workflowId)
                .map(saved -> new Grade(
                        saved.getId(),
                        saved.getThesisId(),
                        saved.getStudentId(),
                        saved.getWorkflowId(),
                        saved.getResolutionId(),
                        saved.getTotalScore(),
                        saved.getStatus(),
                        saved.getCalculatedAt()
                ));
    }
}