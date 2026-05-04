package mn.num.edu.user_service.application.service;

import mn.num.edu.user_service.application.dto.CreateStudentCommand;
import mn.num.edu.user_service.application.dto.CreateTeacherCommand;
import mn.num.edu.user_service.application.port.in.CreateStudentUseCase;
import mn.num.edu.user_service.application.port.in.CreateTeacherUseCase;
import mn.num.edu.user_service.application.port.out.StudentRepositoryPort;
import mn.num.edu.user_service.application.port.out.TeacherRepositoryPort;
import mn.num.edu.user_service.application.port.out.UserEventPublisherPort;
import mn.num.edu.user_service.application.port.out.UserRepositoryPort;
import mn.num.edu.user_service.domain.event.UserCreatedEvent;
import mn.num.edu.user_service.domain.model.Student;
import mn.num.edu.user_service.domain.model.SystemRole;
import mn.num.edu.user_service.domain.model.Teacher;
import mn.num.edu.user_service.domain.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;


@Service
public class CreateTeacherService implements CreateTeacherUseCase {

    private static final Logger log = LoggerFactory.getLogger(CreateTeacherService.class);

    private final UserRepositoryPort userRepositoryPort;
    private final TeacherRepositoryPort teacherProfileRepositoryPort;
    private final UserEventPublisherPort eventPublisherPort;

    public CreateTeacherService(
            UserRepositoryPort userRepositoryPort,
            TeacherRepositoryPort teacherProfileRepositoryPort,

            @Qualifier("kafkaUserEventPublisherAdapter")
            UserEventPublisherPort eventPublisherPort) {
        this.userRepositoryPort = userRepositoryPort;
        this.teacherProfileRepositoryPort = teacherProfileRepositoryPort;
        this.eventPublisherPort = eventPublisherPort;
    }

    @Override
    public Mono<User> execute(CreateTeacherCommand command) {
        log.info("Creating Teacher. email={}, TeacherId={}, departmentId={}"
        );

        User user = User.create(
                command.firstName(),
                command.lastName(),
                command.email(),
                SystemRole.TEACHER,
                command.departmentId()
        );

        return userRepositoryPort.save(user)
                .flatMap(savedUser -> {
                    Teacher profile = Teacher.create(
                            savedUser.getId(),
                            command.position()
                    );

                    return teacherProfileRepositoryPort.save(profile)
                            .then(eventPublisherPort.publishTeacherCreated(UserCreatedEvent.from(savedUser)))
                            .thenReturn(savedUser);
                })
                .doOnSuccess(saved -> log.info("Teacher created successfully. userId={}", saved.getId()))
                .doOnError(error -> log.error("Failed to create Teacher. email={}", command.email(), error));
    }
}
