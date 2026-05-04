package mn.num.edu.user_service.application.service;

import mn.num.edu.user_service.application.dto.CreateExternalExpertCommand;
import mn.num.edu.user_service.application.port.in.CreateExternalExpertUseCase;
import mn.num.edu.user_service.application.port.out.AuthServicePort;
import mn.num.edu.user_service.application.port.out.ExternalExpertRepositoryPort;
import mn.num.edu.user_service.application.port.out.UserEventPublisherPort;
import mn.num.edu.user_service.application.port.out.UserRepositoryPort;
import mn.num.edu.user_service.domain.event.UserCreatedEvent;
import mn.num.edu.user_service.domain.model.ExternalExpert;
import mn.num.edu.user_service.domain.model.SystemRole;
import mn.num.edu.user_service.domain.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class CreateExternalExpertService implements CreateExternalExpertUseCase {

    private static final Logger log = LoggerFactory.getLogger(CreateExternalExpertService.class);

    private final UserRepositoryPort userRepositoryPort;
    private final ExternalExpertRepositoryPort expertRepositoryPort;
    private final UserEventPublisherPort eventPublisherPort;
    private final AuthServicePort authServicePort;
    private final String defaultPassword;

    public CreateExternalExpertService(
            UserRepositoryPort userRepositoryPort,
            ExternalExpertRepositoryPort expertRepositoryPort,
            @Qualifier("kafkaUserEventPublisherAdapter")
            UserEventPublisherPort eventPublisherPort,
            AuthServicePort authServicePort,
            @Value("${app.auth.default-password:Num2024!}") String defaultPassword) {
        this.userRepositoryPort = userRepositoryPort;
        this.expertRepositoryPort = expertRepositoryPort;
        this.eventPublisherPort = eventPublisherPort;
        this.authServicePort = authServicePort;
        this.defaultPassword = defaultPassword;
    }

    @Override
    public Mono<User> execute(CreateExternalExpertCommand command) {
        log.info("Creating ExternalExpert. email={}", command.email());

        User user = User.create(
                command.firstName(),
                command.lastName(),
                command.email(),
                SystemRole.EXTERNAL_EXPERT,
                command.departmentId()
        );

        String password = (command.password() != null && !command.password().isBlank())
                ? command.password() : defaultPassword;

        return userRepositoryPort.save(user)
                .flatMap(savedUser -> {
                    ExternalExpert profile = ExternalExpert.create(
                            savedUser.getId(),
                            command.organization(),
                            command.expertise()
                    );
                    return expertRepositoryPort.save(profile)
                            // Register login credentials in auth-service. sisiId = email so the
                            // expert logs in with their email address. If this fails, roll back
                            // the user + profile so the admin can retry cleanly instead of ending
                            // up with an orphan user_service record that can never authenticate.
                            .then(authServicePort.registerCredentials(
                                    command.email(), password, "ROLE_EXTERNAL_EXPERT"))
                            .onErrorResume(authErr -> {
                                log.error("Auth registration failed for {}. Rolling back user {}.",
                                        command.email(), savedUser.getId(), authErr);
                                return userRepositoryPort.deleteById(savedUser.getId())
                                        .then(Mono.error(new RuntimeException(
                                                "auth-service registration failed: " + authErr.getMessage(), authErr)));
                            })
                            .then(eventPublisherPort.publishTeacherCreated(UserCreatedEvent.from(savedUser)))
                            .thenReturn(savedUser);
                })
                .doOnSuccess(saved -> log.info("ExternalExpert created. userId={}", saved.getId()))
                .doOnError(err -> log.error("Failed to create ExternalExpert. email={}", command.email(), err));
    }
}
