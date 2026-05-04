package mn.num.edu.message_service.application.port.out;

import mn.num.edu.message_service.domain.model.Message;
import org.springframework.data.r2dbc.repository.Query;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MessageRepositoryPort {

    Mono<Message> save(Message message);

    Mono<Message> saveSeen(Message message);

    Flux<Message> findByConversationId(String conversationId);

    Flux<Message> findUnreadMessages(String conversationId, String receiverId);
    Mono<Void> markMessagesAsSeen(String conversationId, String receiverId);
}