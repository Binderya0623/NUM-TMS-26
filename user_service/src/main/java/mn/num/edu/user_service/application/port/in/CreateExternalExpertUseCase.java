package mn.num.edu.user_service.application.port.in;

import mn.num.edu.user_service.application.dto.CreateExternalExpertCommand;
import mn.num.edu.user_service.domain.model.User;
import reactor.core.publisher.Mono;

public interface CreateExternalExpertUseCase {
    Mono<User> execute(CreateExternalExpertCommand command);
}
