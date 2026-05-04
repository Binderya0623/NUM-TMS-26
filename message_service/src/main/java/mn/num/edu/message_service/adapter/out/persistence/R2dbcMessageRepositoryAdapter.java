package mn.num.edu.message_service.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import mn.num.edu.message_service.application.port.out.MessageRepositoryPort;
import mn.num.edu.message_service.domain.model.Message;
import mn.num.edu.message_service.domain.model.MessageStatus;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class R2dbcMessageRepositoryAdapter implements MessageRepositoryPort {

    private final MessageR2dbcRepository repository;

    @Override
    public Mono<Message> save(Message message) {
        return repository.save(toEntity(message))
                .map(this::toDomain);
    }
    @Override
    public Mono<Void> markMessagesAsSeen(String conversationId, String receiverId) {
        return repository.markMessagesAsSeen(conversationId, receiverId)
                .then();
    }
    @Override
    public Mono<Message> saveSeen(Message message) {
        Message seenMessage = message.markSeen();

        return repository.save(toEntity(seenMessage))
                .map(this::toDomain);
    }

    @Override
    public Flux<Message> findByConversationId(String conversationId) {
        return repository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .map(this::toDomain);
    }

    @Override
    public Flux<Message> findUnreadMessages(String conversationId, String receiverId) {
        return repository.findByConversationIdAndReceiverIdAndStatus(
                conversationId,
                receiverId,
                MessageStatus.SENT
        ).map(this::toDomain);
    }

    private MessageEntity toEntity(Message message) {
        return MessageEntity.builder()
                .id(message.id())
                .conversationId(message.conversationId())
                .senderId(message.senderId())
                .receiverId(message.receiverId())
                .content(message.content())
                .status(message.status())
                .createdAt(message.createdAt())
                .seenAt(message.seenAt())
                .build();
    }

    private Message toDomain(MessageEntity entity) {
        return new Message(
                entity.getId(),
                entity.getConversationId(),
                entity.getSenderId(),
                entity.getReceiverId(),
                entity.getContent(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getSeenAt()
        );
    }
}