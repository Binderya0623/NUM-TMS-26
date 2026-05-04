package mn.num.edu.committee_service.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import mn.num.edu.committee_service.application.port.out.CommitteeRepositoryPort;
import mn.num.edu.committee_service.domain.model.Committee;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class R2dbcCommitteeRepositoryAdapter implements CommitteeRepositoryPort {

    private final CommitteeR2dbcRepository repository;


    @Override
    public Mono<Committee> save(Committee committee) {
        return repository.save(committee);
    }

    @Override
    public Mono<Committee> findById(String id) {
        return repository.findById(id);
    }

    @Override
    public Flux<Committee> findAll() {
        return repository.findAll();
    }


}
