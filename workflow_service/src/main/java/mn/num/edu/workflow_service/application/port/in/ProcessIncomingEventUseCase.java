package mn.num.edu.workflow_service.application.port.in;

import reactor.core.publisher.Mono;

public interface ProcessIncomingEventUseCase {
    Mono<Void> handleThesisApproved(String departmentId);
    Mono<Void> handleCommitteeCreated(String departmentId);
    Mono<Void> handleReportSubmitted(String departmentId);
    Mono<Void> handleEvaluationSubmitted(String departmentId, String stageName);
}