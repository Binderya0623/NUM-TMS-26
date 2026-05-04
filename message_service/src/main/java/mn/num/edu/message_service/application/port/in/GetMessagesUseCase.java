package mn.num.edu.message_service.application.port.in;

import mn.num.edu.message_service.domain.model.Message;
import reactor.core.publisher.Flux;

public interface GetMessagesUseCase {
    Flux<Message> getMessages(String conversationId);
}