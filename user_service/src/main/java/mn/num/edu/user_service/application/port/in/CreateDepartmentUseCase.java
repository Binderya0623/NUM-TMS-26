package mn.num.edu.user_service.application.port.in;


import mn.num.edu.user_service.application.dto.CreateDepartmentCommand;
import mn.num.edu.user_service.application.dto.CreateTeacherCommand;
import mn.num.edu.user_service.domain.model.User;
import reactor.core.publisher.Mono;

public interface CreateDepartmentUseCase {
    Mono<User> execute(CreateDepartmentCommand command);
}

