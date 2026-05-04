package mn.num.edu.user_service.application.service;

import mn.num.edu.user_service.application.dto.CreateStudentCommand;
import mn.num.edu.user_service.application.dto.CreateUserCommand;
import mn.num.edu.user_service.application.port.in.CreateStudentUseCase;
import mn.num.edu.user_service.application.port.in.CreateUserUseCase;
import mn.num.edu.user_service.application.port.out.StudentRepositoryPort;
import mn.num.edu.user_service.application.port.out.UserEventPublisherPort;
import mn.num.edu.user_service.application.port.out.UserRepositoryPort;
import mn.num.edu.user_service.domain.event.UserCreatedEvent;
import mn.num.edu.user_service.domain.model.Student;
import mn.num.edu.user_service.domain.model.SystemRole;
import mn.num.edu.user_service.domain.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;


@Service
public class CreateStudentService implements CreateStudentUseCase {

    private static final Logger log = LoggerFactory.getLogger(CreateStudentService.class);

    private final UserRepositoryPort userRepositoryPort;
    private final StudentRepositoryPort studentProfileRepositoryPort;
    private final UserEventPublisherPort eventPublisherPort;

    public CreateStudentService(
            UserRepositoryPort userRepositoryPort,
            StudentRepositoryPort studentProfileRepositoryPort,

            @Qualifier("kafkaUserEventPublisherAdapter")
            UserEventPublisherPort eventPublisherPort    ) {
        this.userRepositoryPort = userRepositoryPort;
        this.studentProfileRepositoryPort = studentProfileRepositoryPort;
        this.eventPublisherPort = eventPublisherPort;
    }

    @Override
    public Mono<User> execute(CreateStudentCommand command) {
        log.info("Creating student. email={}, studentId={}, departmentId={}"
        );

        User user = User.create(
                command.firstName(),
                command.lastName(),
                command.email(),
                SystemRole.STUDENT,
                command.departmentId()
        );

        return userRepositoryPort.save(user)
                .flatMap(savedUser -> {
                    Student profile = Student.create(
                            savedUser.getId(),
                            command.studentId(),
                            command.major()
                    );

                    return studentProfileRepositoryPort.save(profile)
                            .then(eventPublisherPort.publishStudentCreated(UserCreatedEvent.from(savedUser)))
                            .thenReturn(savedUser);
                })
                .doOnSuccess(saved -> log.info("Student created successfully. userId={}", saved.getId()))
                .doOnError(error -> log.error("Failed to create student. email={}", command.email(), error));
    }
}
