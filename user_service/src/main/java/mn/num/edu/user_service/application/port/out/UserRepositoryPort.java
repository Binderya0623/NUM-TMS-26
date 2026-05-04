package mn.num.edu.user_service.application.port.out;

import mn.num.edu.user_service.domain.model.User;

import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
@NoRepositoryBean

public interface UserRepositoryPort {
    Mono<User> save(User user);
    Mono<User> findById(String id);
    Mono<Void> deleteById(String id);
    Flux<User> findAll();
    Flux<User> findStudents(String departmentId);
    Flux<User> findTeachers(String departmentId);
    Flux<User> findExternalExperts(String departmentId);
}