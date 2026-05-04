package mn.num.edu.thesis_service.application.port.out;


import mn.num.edu.thesis_service.domain.event.*;
import reactor.core.publisher.Mono;

public interface ThesisEventPublisherPort {

    Mono<Void> publishThesisCreated(ThesisCreatedEvent event);

    Mono<Void> publishThesisUpdated(ThesisUpdatedEvent event);

    Mono<Void> publishThesisApproved(ThesisApprovedEvent event);

    Mono<Void> publishThesisRejected(ThesisRejectedEvent event);

    Mono<Void> publishThesisStatusChanged(ThesisStatusChangedEvent event);
}