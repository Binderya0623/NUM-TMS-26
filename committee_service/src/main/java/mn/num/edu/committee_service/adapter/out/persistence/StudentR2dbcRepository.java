
package mn.num.edu.committee_service.adapter.out.persistence;

import mn.num.edu.committee_service.domain.model.CommitteeStudent;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface StudentR2dbcRepository extends ReactiveCrudRepository<CommitteeStudent, String> {

    @Query("SELECT * FROM committee_students WHERE committee_id = :committeeId")
    Flux<CommitteeStudent> findByCommitteeId(String committeeId);

    @Query("SELECT * FROM committee_students WHERE student_id = :studentId")
    Flux<CommitteeStudent> findByStudentId(String studentId);
}