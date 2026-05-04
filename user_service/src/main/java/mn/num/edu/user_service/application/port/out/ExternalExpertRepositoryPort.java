package mn.num.edu.user_service.application.port.out;

import mn.num.edu.user_service.domain.model.ExternalExpert;
import reactor.core.publisher.Mono;

public interface ExternalExpertRepositoryPort {
    Mono<ExternalExpert> save(ExternalExpert profile);
    Mono<ExternalExpert> findByUserId(String userId);
}
