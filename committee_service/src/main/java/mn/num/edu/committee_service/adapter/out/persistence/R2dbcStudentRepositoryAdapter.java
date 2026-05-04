package mn.num.edu.committee_service.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import mn.num.edu.committee_service.application.port.out.CommitteeRepositoryPort;
import mn.num.edu.committee_service.application.port.out.CommitteeStudentRepositoryPort;
import mn.num.edu.committee_service.domain.model.Committee;
import mn.num.edu.committee_service.domain.model.CommitteeStudent;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class R2dbcStudentRepositoryAdapter implements CommitteeStudentRepositoryPort {

    private final StudentR2dbcRepository repository;

    @Override
    public Mono<CommitteeStudent> save(CommitteeStudent student) {
        return repository.save(student);
    }
}
