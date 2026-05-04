package mn.num.edu.committee_service.application.port.out;

import mn.num.edu.committee_service.domain.model.CommitteeRole;
import mn.num.edu.committee_service.domain.model.CommitteeTeacher;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface CommitteeTeacherRepositoryPort {
    Mono<CommitteeTeacher> save(CommitteeTeacher teacher);
    Mono<Boolean> existsByCommitteeIdAndRole(String committeeId, CommitteeRole role);
}
