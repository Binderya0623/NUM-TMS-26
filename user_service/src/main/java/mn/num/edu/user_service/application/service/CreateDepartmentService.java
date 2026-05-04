package mn.num.edu.user_service.application.service;

import mn.num.edu.user_service.application.dto.CreateDepartmentCommand;
import mn.num.edu.user_service.application.dto.CreateStudentCommand;
import mn.num.edu.user_service.application.port.in.CreateDepartmentUseCase;
import mn.num.edu.user_service.application.port.in.CreateStudentUseCase;
import mn.num.edu.user_service.application.port.out.DepartmentRepositoryPort;
import mn.num.edu.user_service.application.port.out.StudentRepositoryPort;
import mn.num.edu.user_service.application.port.out.UserEventPublisherPort;
import mn.num.edu.user_service.application.port.out.UserRepositoryPort;
import mn.num.edu.user_service.domain.event.UserCreatedEvent;
import mn.num.edu.user_service.domain.model.Department;
import mn.num.edu.user_service.domain.model.Student;
import mn.num.edu.user_service.domain.model.SystemRole;
import mn.num.edu.user_service.domain.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;


@Service
public class CreateDepartmentService implements CreateDepartmentUseCase {

    private static final Logger log = LoggerFactory.getLogger(CreateDepartmentService.class);

    private final UserRepositoryPort userRepositoryPort;
    private final DepartmentRepositoryPort departmentProfileRepositoryPort;
    private final UserEventPublisherPort eventPublisherPort;

    public CreateDepartmentService(
            UserRepositoryPort userRepositoryPort,
            DepartmentRepositoryPort departmentProfileRepositoryPort,

            @Qualifier("kafkaUserEventPublisherAdapter")
            UserEventPublisherPort eventPublisherPort    ) {
        this.userRepositoryPort = userRepositoryPort;
        this.departmentProfileRepositoryPort = departmentProfileRepositoryPort;
        this.eventPublisherPort = eventPublisherPort;
    }

    @Override
    public Mono<User> execute(CreateDepartmentCommand command) {
        log.info("Creating Department. email={}, studentId={}, departmentId={}"
        );

        User user = User.create(
                command.firstName(),
                command.lastName(),
                command.email(),
                SystemRole.DEPARTMENT,
                command.departmentName()
        );

        return userRepositoryPort.save(user)
                .flatMap(savedUser -> {
                    Department profile = Department.create(
                            savedUser.getId(),
                            command.departmentName()
                    );

                    return departmentProfileRepositoryPort.save(profile)
                            .then(eventPublisherPort.publishDepartmentCreated(UserCreatedEvent.from(savedUser)))
                            .thenReturn(savedUser);
                })
                .doOnSuccess(saved -> log.info("Department created successfully. userId={}", saved.getId()))
                .doOnError(error -> log.error("Failed to create Department. email={}", command.email(), error));
    }
}
