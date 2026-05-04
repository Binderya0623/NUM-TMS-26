package mn.num.edu.committee_service.application.port.out;

import mn.num.edu.committee_service.domain.model.CommitteeTeacher;
import reactor.core.publisher.Mono;
import mn.num.edu.committee_service.domain.model.CommitteeRole;
import mn.num.edu.committee_service.domain.model.CommitteeTeacher;
import reactor.core.publisher.Mono;

public interface TeacherSnapshotRepositoryPort {
    Mono<TeacherSnapshot> save(TeacherSnapshot teacher);

    Mono<TeacherSnapshot> findByTeacherId(String s);
}
