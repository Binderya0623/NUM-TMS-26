package mn.num.edu.grading_service.application.service;

import mn.num.edu.grading_service.application.port.in.CalculateFinalGradeUseCase;
import mn.num.edu.grading_service.application.port.out.EventPublisherPort;
import mn.num.edu.grading_service.application.port.out.GradeRepositoryPort;
import mn.num.edu.grading_service.domain.event.FinalGradeCalculatedEvent;
import mn.num.edu.grading_service.domain.model.Grade;
import mn.num.edu.grading_service.domain.model.GradeStatus;
import mn.num.edu.grading_service.domain.service.GradeDomainService;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

public class CalculateFinalGradeService implements CalculateFinalGradeUseCase {

    private final GradeRepositoryPort gradeRepositoryPort;
    private final EventPublisherPort eventPublisherPort;
    private final GradeDomainService gradeDomainService;

    public CalculateFinalGradeService(GradeRepositoryPort gradeRepositoryPort,
                                      EventPublisherPort eventPublisherPort,
                                      GradeDomainService gradeDomainService) {
        this.gradeRepositoryPort = gradeRepositoryPort;
        this.eventPublisherPort = eventPublisherPort;
        this.gradeDomainService = gradeDomainService;
    }

    @Override
    public Mono<Void> calculateForThesis(String thesisId, String studentId, String workflowId, Double stageScore) {
        double incomingScore = stageScore == null ? 0.0 : stageScore;

        return gradeRepositoryPort.findByThesisId(thesisId)
                .switchIfEmpty(Mono.just(Grade.create(thesisId, studentId, workflowId)))
                .flatMap(current -> {
                    double currentScore = current.getTotalScore() == null ? 0.0 : current.getTotalScore();
                    double totalScore = gradeDomainService.calculateTotalScore(currentScore + incomingScore);
                    GradeStatus status = gradeDomainService.determineStatus(totalScore);

                    Grade grade = new Grade(
                            current.getId(),
                            thesisId,
                            studentId,
                            workflowId,
                            current.getResolutionId(),
                            totalScore,
                            status,
                            LocalDateTime.now()
                    );

                    return gradeRepositoryPort.save(grade)
                            .flatMap(saved -> eventPublisherPort.publish(
                                    "final-grade-calculated",
                                    new FinalGradeCalculatedEvent(
                                            saved.getThesisId(),
                                            saved.getStudentId(),
                                            saved.getWorkflowId(),
                                            saved.getTotalScore(),
                                            saved.getStatus(),
                                            saved.getCalculatedAt()
                                    )
                            ));
                });
    }
}
