package mn.num.edu.committee_service.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import mn.num.edu.committee_service.application.port.out.CommitteeTeacherRepositoryPort;
import mn.num.edu.committee_service.domain.model.Committee;
import mn.num.edu.committee_service.domain.model.CommitteeRole;
import mn.num.edu.committee_service.domain.model.CommitteeStudent;
import mn.num.edu.committee_service.domain.model.CommitteeTeacher;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class R2dbcTeacherRepositoryAdapter implements CommitteeTeacherRepositoryPort {

    private final TeacherR2dbcRepository repository;

    @Override
    public Mono<CommitteeTeacher> save(CommitteeTeacher committeeTeacher) {
        return repository.save(committeeTeacher);
    }

    @Override
    public Mono<Boolean> existsByCommitteeIdAndRole(String committeeId, CommitteeRole role) {
        return repository.existsById(String.valueOf(committeeId));
    }
}
