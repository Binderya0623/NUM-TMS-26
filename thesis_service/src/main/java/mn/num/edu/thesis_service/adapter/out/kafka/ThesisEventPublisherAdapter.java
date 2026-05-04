package mn.num.edu.thesis_service.adapter.out.kafka;

import mn.num.edu.thesis_service.application.port.out.ThesisEventPublisherPort;
import mn.num.edu.thesis_service.domain.event.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class ThesisEventPublisherAdapter implements ThesisEventPublisherPort {

    private static final Logger log = LoggerFactory.getLogger(ThesisEventPublisherAdapter.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public ThesisEventPublisherAdapter(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public Mono<Void> publishThesisCreated(ThesisCreatedEvent event) {
        return Mono.fromRunnable(() -> {
            log.info("📤 Sending ThesisCreatedEvent: thesisId={}", event.thesisId());
            kafkaTemplate.send("thesis-created", event.thesisId().toString(), event);
        });
    }

    @Override
    public Mono<Void> publishThesisUpdated(ThesisUpdatedEvent event) {
        return Mono.fromRunnable(() -> {
            log.info("📤 Sending ThesisUpdatedEvent: thesisId={}", event.thesisId());
            kafkaTemplate.send("thesis-updated", event.thesisId().toString(), event);
        });
    }

    @Override
    public Mono<Void> publishThesisApproved(ThesisApprovedEvent event) {
        return Mono.fromRunnable(() -> {
            log.info("✅ Sending ThesisApprovedEvent: thesisId={}", event.thesisId());
            kafkaTemplate.send("thesis-approved", event.thesisId().toString(), event);
        });
    }

    @Override
    public Mono<Void> publishThesisRejected(ThesisRejectedEvent event) {
        return Mono.fromRunnable(() -> {
            log.warn("❌ Sending ThesisRejectedEvent: thesisId={}", event.thesisId());
            kafkaTemplate.send("thesis-rejected", event.thesisId().toString(), event);
        });
    }

    @Override
    public Mono<Void> publishThesisStatusChanged(ThesisStatusChangedEvent event) {
        return Mono.fromRunnable(() -> {
            log.info("🔄 Sending ThesisStatusChangedEvent: thesisId={}, status={}",
                    event.thesisId(), event.newStatus());
            kafkaTemplate.send("thesis-status-changed", event.thesisId().toString(), event);
        });
    }
}