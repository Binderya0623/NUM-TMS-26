package mn.num.edu.user_service.adapter.out.persistence;

import mn.num.edu.user_service.domain.model.ExternalExpert;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface ExternalExpertR2dbcRepository extends ReactiveCrudRepository<ExternalExpert, String> {
    Mono<ExternalExpert> findByUserId(String userId);
}
