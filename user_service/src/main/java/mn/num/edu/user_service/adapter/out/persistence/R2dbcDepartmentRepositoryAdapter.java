package mn.num.edu.user_service.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import mn.num.edu.user_service.application.port.out.DepartmentRepositoryPort;
import mn.num.edu.user_service.application.port.out.StudentRepositoryPort;
import mn.num.edu.user_service.domain.model.Department;
import mn.num.edu.user_service.domain.model.Student;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class R2dbcDepartmentRepositoryAdapter implements DepartmentRepositoryPort {

    private final DepartmentR2dbcRepository repository;

    @Override
    public Mono<Department> save(Department profile) {
        return repository.save(profile);
    }

    @Override
    public Mono<Department> findById(String userId) {
        return repository.findById(userId);
    }

    @Override
    public Flux<Department> findAll() {
        return repository.findAll();
    }

}
