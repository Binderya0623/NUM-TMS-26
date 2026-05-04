package mn.num.edu.user_service.application.port.in;

import mn.num.edu.user_service.domain.model.User;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface FindUserUseCase {
    Mono<User> findById(String id);
    Flux<User> findAll();
    Mono<User> findByName(String name);
    Flux<User> findStudents(String departmentId);
    Flux<User> findTeachers(String departmentId);
    Flux<User> findExternalExperts(String departmentId);
}
