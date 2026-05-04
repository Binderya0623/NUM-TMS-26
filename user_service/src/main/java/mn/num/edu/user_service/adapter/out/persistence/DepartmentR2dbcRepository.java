package mn.num.edu.user_service.adapter.out.persistence;

import mn.num.edu.user_service.domain.model.Department;
import mn.num.edu.user_service.domain.model.Student;
import mn.num.edu.user_service.domain.model.User;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface DepartmentR2dbcRepository extends ReactiveCrudRepository<Department, String> {

}
