package mn.num.edu.user_service.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import mn.num.edu.user_service.application.port.out.StudentRepositoryPort;
import mn.num.edu.user_service.application.port.out.TeacherRepositoryPort;
import mn.num.edu.user_service.domain.model.Student;
import mn.num.edu.user_service.domain.model.Teacher;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class R2dbcTeacherRepositoryAdapter implements TeacherRepositoryPort {

    private final TeacherR2dbcRepository repository;

    @Override
    public Mono<Teacher> save(Teacher profile) {
        return repository.save(profile);
    }

    @Override
    public Mono<Teacher> findByUserId(String userId) {
        return repository.findByUserId(userId);
    }


}
