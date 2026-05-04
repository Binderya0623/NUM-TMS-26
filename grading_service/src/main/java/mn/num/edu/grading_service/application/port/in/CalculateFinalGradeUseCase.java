package mn.num.edu.grading_service.application.port.in;

import reactor.core.publisher.Mono;

public interface CalculateFinalGradeUseCase {
    Mono<Void> calculateForThesis(String thesisId, String studentId, String workflowId, Double stageScore);
}
