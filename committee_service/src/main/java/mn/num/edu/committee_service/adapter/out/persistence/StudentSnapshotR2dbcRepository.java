
package mn.num.edu.committee_service.adapter.out.persistence;

import mn.num.edu.committee_service.application.port.out.StudentSnapshot;
import mn.num.edu.committee_service.application.port.out.TeacherSnapshot;
import mn.num.edu.committee_service.domain.model.CommitteeStudent;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentSnapshotR2dbcRepository extends ReactiveCrudRepository<StudentSnapshot, String> {
}
@Repository
interface TeacherSnapshotR2dbcRepository extends ReactiveCrudRepository<TeacherSnapshot, String> {
}