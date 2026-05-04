package mn.num.edu.message_service.application.service;

import lombok.RequiredArgsConstructor;
import mn.num.edu.message_service.application.dto.SendMessageCommand;
import mn.num.edu.message_service.application.port.in.SendMessageUseCase;
import mn.num.edu.message_service.application.port.out.MessageEventPublisherPort;
import mn.num.edu.message_service.application.port.out.MessageRepositoryPort;
import mn.num.edu.message_service.domain.event.MessageSentEvent;
import mn.num.edu.message_service.domain.model.Message;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class SendMessageService implements SendMessageUseCase {

    private final MessageRepositoryPort messageRepositoryPort;
    private final MessageEventPublisherPort eventPublisherPort;

    @Override
    public Mono<Message> send(SendMessageCommand command) {
        Message message = Message.create(
                command.conversationId(),
                command.senderId(),
                command.receiverId(),
                command.content()
        );

        return messageRepositoryPort.save(message)
                .flatMap(saved ->
                        eventPublisherPort.publishMessageSent(
                                new MessageSentEvent(
                                        saved.id(),
                                        saved.conversationId(),
                                        saved.senderId(),
                                        saved.receiverId(),
                                        saved.content(),
                                        saved.createdAt()
                                )
                        ).thenReturn(saved)
                );
    }
}