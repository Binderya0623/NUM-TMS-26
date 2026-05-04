package mn.num.edu.user_service.adapter.out.persistence;

import mn.num.edu.user_service.domain.model.SystemRole;
import mn.num.edu.user_service.domain.model.User;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UserR2dbcRepository extends ReactiveCrudRepository<User, String> {

    Flux<User> findBySystemRole(SystemRole systemRole);

    Flux<User> findByDepartmentIdAndSystemRole(String departmentId, SystemRole systemRole);

    Flux<User> findByDepartmentId(String departmentId);

    Mono<User> findByEmail(String email);
}
