package mn.num.edu.message_service.application.service;

import lombok.RequiredArgsConstructor;
import mn.num.edu.message_service.application.port.in.MarkMessageSeenUseCase;
import mn.num.edu.message_service.application.port.out.MessageEventPublisherPort;
import mn.num.edu.message_service.application.port.out.MessageRepositoryPort;
import mn.num.edu.message_service.domain.event.MessageSeenEvent;
import mn.num.edu.message_service.domain.model.Message;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class MarkMessageSeenService implements MarkMessageSeenUseCase {

    private final MessageRepositoryPort messageRepositoryPort;
    private final MessageEventPublisherPort messageEventPublisherPort;

    @Override
    public Mono<Void> markSeen(String conversationId, String userId) {

        return messageRepositoryPort
                .markMessagesAsSeen(conversationId, userId)
                .then(
                        messageEventPublisherPort.publishMessageSeen(
                                new MessageSeenEvent(
                                        conversationId,
                                        userId,
                                        Instant.now()
                                )
                        ).onErrorResume(e -> Mono.empty())
                );
    }
}