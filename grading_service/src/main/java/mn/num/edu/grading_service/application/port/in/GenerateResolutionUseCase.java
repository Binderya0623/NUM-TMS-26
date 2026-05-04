package mn.num.edu.grading_service.application.port.in;

import reactor.core.publisher.Mono;
import java.util.UUID;

public interface GenerateResolutionUseCase {
    Mono<Void> generate(String workflowId);
}