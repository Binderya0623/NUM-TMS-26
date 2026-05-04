package mn.num.edu.user_service.application.port.in;

import mn.num.edu.user_service.application.dto.CreateStudentCommand;
import mn.num.edu.user_service.domain.model.User;
import reactor.core.publisher.Mono;

public interface CreateStudentUseCase {
    Mono<User> execute(CreateStudentCommand command);
}
