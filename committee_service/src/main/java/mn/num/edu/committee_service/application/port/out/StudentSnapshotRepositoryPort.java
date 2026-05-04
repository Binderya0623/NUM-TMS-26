package mn.num.edu.committee_service.application.port.out;

import reactor.core.publisher.Mono;

public interface StudentSnapshotRepositoryPort {
    Mono<StudentSnapshot> save(StudentSnapshot student);

}
