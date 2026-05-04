package mn.num.edu.message_service.application.port.out;

import mn.num.edu.message_service.domain.event.MessageSeenEvent;
import mn.num.edu.message_service.domain.event.MessageSentEvent;
import reactor.core.publisher.Mono;

public interface MessageEventPublisherPort {
    Mono<Void> publishMessageSent(MessageSentEvent event);
    Mono<Void> publishMessageSeen(MessageSeenEvent event);
}