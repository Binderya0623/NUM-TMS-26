package mn.num.edu.committee_service.application.port.out;

import mn.num.edu.committee_service.domain.model.CommitteeStudent;
import reactor.core.publisher.Mono;

public interface CommitteeStudentRepositoryPort {
    Mono<CommitteeStudent> save(CommitteeStudent student);
}
