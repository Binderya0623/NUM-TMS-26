package mn.num.edu.grading_service.application.service;

import mn.num.edu.grading_service.application.port.in.GenerateResolutionUseCase;
import mn.num.edu.grading_service.application.port.out.EventPublisherPort;
import mn.num.edu.grading_service.application.port.out.GradeRepositoryPort;
import mn.num.edu.grading_service.application.port.out.ResolutionRepositoryPort;
import mn.num.edu.grading_service.domain.event.ResolutionGeneratedEvent;
import mn.num.edu.grading_service.domain.model.GradeStatus;
import mn.num.edu.grading_service.domain.model.Resolution;
import mn.num.edu.grading_service.domain.model.ResolutionStudentResult;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class GenerateResolutionService implements GenerateResolutionUseCase {

    private final GradeRepositoryPort gradeRepositoryPort;
    private final ResolutionRepositoryPort resolutionRepositoryPort;
    private final EventPublisherPort eventPublisherPort;

    public GenerateResolutionService(GradeRepositoryPort gradeRepositoryPort,
                                     ResolutionRepositoryPort resolutionRepositoryPort,
                                     EventPublisherPort eventPublisherPort) {
        this.gradeRepositoryPort = gradeRepositoryPort;
        this.resolutionRepositoryPort = resolutionRepositoryPort;
        this.eventPublisherPort = eventPublisherPort;
    }

    @Override
    public Mono<Void> generate( String workflowId) {
        return gradeRepositoryPort.findByWorkflowId(workflowId)
                .collectList()
                .flatMap(grades -> {
                    int totalStudents = grades.size();
                    int passedCount = (int) grades.stream()
                            .filter(g -> g.getStatus() == GradeStatus.PASSED)
                            .count();
                    int failedCount = totalStudents - passedCount;

                    List<ResolutionStudentResult> results = grades.stream()
                            .map(g -> new ResolutionStudentResult(
                                    g.getStudentId(),
                                    g.getThesisId(),
                                    g.getTotalScore(),
                                    g.getStatus()
                            ))
                            .toList();

                    Resolution resolution = new Resolution(
                            UUID.randomUUID().toString(),
                            workflowId,
                            generateResolutionNumber(),
                            totalStudents,
                            passedCount,
                            failedCount,
                            LocalDateTime.now(),
                            results
                    );

                    return resolutionRepositoryPort.save(resolution)
                            .flatMap(saved -> eventPublisherPort.publish(
                                    "resolution-generated",
                                    new ResolutionGeneratedEvent(
                                            saved.getId(),
                                            saved.getWorkflowId(),
                                            saved.getTotalStudents(),
                                            saved.getPassedCount(),
                                            saved.getFailedCount(),
                                            saved.getGeneratedAt()
                                    )
                            ));
                });
    }

    private String generateResolutionNumber() {
        return "TOGTOOL-" + System.currentTimeMillis();
    }
}
