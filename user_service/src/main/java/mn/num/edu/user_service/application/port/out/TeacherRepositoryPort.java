package mn.num.edu.user_service.application.port.out;

import mn.num.edu.user_service.domain.model.Teacher;
import mn.num.edu.user_service.domain.model.User;
import org.springframework.data.repository.NoRepositoryBean;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@NoRepositoryBean

public interface TeacherRepositoryPort {
    Mono<Teacher> save(Teacher profile);
    Mono<Teacher> findByUserId(String userId);
}