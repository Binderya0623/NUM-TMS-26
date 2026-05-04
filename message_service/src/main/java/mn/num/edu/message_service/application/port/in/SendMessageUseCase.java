package mn.num.edu.message_service.application.port.in;

import mn.num.edu.message_service.application.dto.SendMessageCommand;
import mn.num.edu.message_service.domain.model.Message;
import reactor.core.publisher.Mono;

public interface SendMessageUseCase {
    Mono<Message> send(SendMessageCommand command);
}