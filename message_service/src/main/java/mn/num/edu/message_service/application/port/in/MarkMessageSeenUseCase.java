package mn.num.edu.message_service.application.port.in;

import reactor.core.publisher.Mono;

public interface MarkMessageSeenUseCase {
    Mono<Void> markSeen(String conversationId, String userId);
}