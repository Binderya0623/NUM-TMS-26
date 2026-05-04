package mn.num.edu.user_service.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import mn.num.edu.user_service.application.port.out.StudentRepositoryPort;
import mn.num.edu.user_service.application.port.out.UserRepositoryPort;
import mn.num.edu.user_service.domain.model.Student;
import mn.num.edu.user_service.domain.model.User;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class R2dbcStudentRepositoryAdapter implements StudentRepositoryPort {

    private final StudentR2dbcRepository repository;

    @Override
    public Mono<Student> save(Student profile) {
        return repository.save(profile);
    }

    @Override
    public Mono<Student> findByUserId(String userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public Mono<Student> findByStudentId(String studentId) {
        return repository.findByStudentId(studentId);
    }

}
