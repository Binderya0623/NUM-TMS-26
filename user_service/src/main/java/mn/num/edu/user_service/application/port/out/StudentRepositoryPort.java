package mn.num.edu.user_service.application.port.out;

import mn.num.edu.user_service.domain.model.Student;
import mn.num.edu.user_service.domain.model.User;
import org.springframework.data.repository.NoRepositoryBean;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@NoRepositoryBean

public interface StudentRepositoryPort {
    Mono<Student> save(Student profile);
    Mono<Student> findByUserId(String userId);
    Mono<Student> findByStudentId(String studentId);
}