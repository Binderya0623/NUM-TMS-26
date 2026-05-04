package mn.num.edu.user_service.application.port.out;

import mn.num.edu.user_service.domain.event.UserCreatedEvent;
import mn.num.edu.user_service.domain.model.Department;
import mn.num.edu.user_service.domain.model.Student;
import mn.num.edu.user_service.domain.model.Teacher;
import mn.num.edu.user_service.domain.model.User;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface UserEventPublisherPort  {
    Mono<Void> publishUserCreated(UserCreatedEvent event);

    Mono<Void> publishStudentCreated(UserCreatedEvent event);

    Mono<Void> publishTeacherCreated(UserCreatedEvent event);

    Mono<Void> publishDepartmentCreated(UserCreatedEvent event);
}