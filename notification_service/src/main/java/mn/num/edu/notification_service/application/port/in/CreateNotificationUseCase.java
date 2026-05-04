package mn.num.edu.notification_service.application.port.in;

import mn.num.edu.notification_service.domain.event.*;
import reactor.core.publisher.Mono;

public interface CreateNotificationUseCase {
    Mono<Void> handleThesisApproved(ThesisApprovedEvent event);
    Mono<Void> handleCommitteeAssigned(CommitteeAssignedEvent event);
    Mono<Void> handleReportSubmitted(ReportSubmittedEvent event);
    Mono<Void> handleEvaluationCompleted(EvaluationCompletedEvent event);
    Mono<Void> handleFinalGradeCalculated(FinalGradeCalculatedEvent event);
    Mono<Void> handleWorkflowDeadlineSet(WorkflowDeadlineSetEvent event);
}