package mn.num.edu.user_service.application.port.out;

import mn.num.edu.user_service.domain.model.Department;
import mn.num.edu.user_service.domain.model.User;
import org.springframework.data.repository.NoRepositoryBean;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@NoRepositoryBean

public interface DepartmentRepositoryPort {
    Mono<Department> save(Department user);
    Mono<Department> findById(String id);
    Flux<Department> findAll();
}