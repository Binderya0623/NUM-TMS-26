package mn.num.edu.user_service.application.port.in;


import mn.num.edu.user_service.application.dto.CreateTeacherCommand;
import mn.num.edu.user_service.domain.model.User;
import reactor.core.publisher.Mono;

public interface CreateTeacherUseCase {
    Mono<User> execute(CreateTeacherCommand command);
}

