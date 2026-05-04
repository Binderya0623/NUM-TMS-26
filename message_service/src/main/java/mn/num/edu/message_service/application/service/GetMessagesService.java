package mn.num.edu.message_service.application.service;

import lombok.RequiredArgsConstructor;
import mn.num.edu.message_service.application.port.in.GetMessagesUseCase;
import mn.num.edu.message_service.application.port.out.MessageRepositoryPort;
import mn.num.edu.message_service.domain.model.Message;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class GetMessagesService implements GetMessagesUseCase {

    private final MessageRepositoryPort messageRepositoryPort;

    @Override
    public Flux<Message> getMessages(String conversationId) {
        return messageRepositoryPort.findByConversationId(conversationId);
    }
}