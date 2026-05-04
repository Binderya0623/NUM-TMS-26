package mn.num.edu.grading_service.application.port.out;

import reactor.core.publisher.Mono;

public interface EventPublisherPort {
    Mono<Void> publish(String topic, Object event);
}