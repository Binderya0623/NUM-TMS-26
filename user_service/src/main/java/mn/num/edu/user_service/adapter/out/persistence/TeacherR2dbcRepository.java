package mn.num.edu.user_service.adapter.out.persistence;

import mn.num.edu.user_service.domain.model.Student;
import mn.num.edu.user_service.domain.model.Teacher;
import mn.num.edu.user_service.domain.model.User;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface TeacherR2dbcRepository extends ReactiveCrudRepository<Teacher, String> {

    Mono<Teacher> findByUserId(String userId);
}
