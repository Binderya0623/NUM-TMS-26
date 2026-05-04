package mn.num.edu.user_service.application.port.in;


import mn.num.edu.user_service.application.dto.CreateUserCommand;
import mn.num.edu.user_service.domain.model.User;
import reactor.core.publisher.Mono;

public interface CreateUserUseCase {
    Mono<User> execute(CreateUserCommand command);
}
