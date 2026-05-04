package mn.num.edu.user_service.adapter.out;

import lombok.RequiredArgsConstructor;
import mn.num.edu.user_service.application.port.out.UserEventPublisherPort;
import mn.num.edu.user_service.domain.event.UserCreatedEvent;
import mn.num.edu.user_service.domain.model.Department;
import mn.num.edu.user_service.domain.model.Student;
import mn.num.edu.user_service.domain.model.Teacher;
import mn.num.edu.user_service.domain.model.User;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@Component
public class UserEventPublisherAdapter implements UserEventPublisherPort {

    @Override
    public Mono<Void> publishUserCreated(UserCreatedEvent event) {
        System.out.println("Publishing UserCreatedEvent for user: " + event.getEventId());
        return Mono.empty();
    }

    @Override
    public Mono<Void> publishStudentCreated(UserCreatedEvent event) {
        System.out.println("Publishing StudentCreatedEvent for user: " );
        return Mono.empty();
    }

    @Override
    public Mono<Void> publishTeacherCreated(UserCreatedEvent event) {
        System.out.println("Publishing TeacherCreatedEvent for user: " );
        return Mono.empty();
    }

    @Override
    public Mono<Void> publishDepartmentCreated(UserCreatedEvent event) {
        System.out.println("Publishing DepCreatedEvent for user: " );
        return Mono.empty();
    }

}