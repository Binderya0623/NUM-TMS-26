package mn.num.edu.committee_service.application.port.out;

import mn.num.edu.committee_service.domain.model.Committee;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface CommitteeRepositoryPort {
    Mono<Committee> save(Committee committee);
    Mono<Committee> findById(String id);

    Flux<Committee> findAll();
}