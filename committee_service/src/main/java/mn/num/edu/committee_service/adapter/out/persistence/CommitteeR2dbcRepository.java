
package mn.num.edu.committee_service.adapter.out.persistence;

import mn.num.edu.committee_service.domain.model.Committee;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;
@Repository
public interface CommitteeR2dbcRepository extends ReactiveCrudRepository<Committee, String> {
}