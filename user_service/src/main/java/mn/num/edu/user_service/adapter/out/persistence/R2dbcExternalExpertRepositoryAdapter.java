package mn.num.edu.user_service.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import mn.num.edu.user_service.application.port.out.ExternalExpertRepositoryPort;
import mn.num.edu.user_service.domain.model.ExternalExpert;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class R2dbcExternalExpertRepositoryAdapter implements ExternalExpertRepositoryPort {

    private final ExternalExpertR2dbcRepository repository;

    @Override
    public Mono<ExternalExpert> save(ExternalExpert profile) {
        return repository.save(profile);
    }

    @Override
    public Mono<ExternalExpert> findByUserId(String userId) {
        return repository.findByUserId(userId);
    }
}
