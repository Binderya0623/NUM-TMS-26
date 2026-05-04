package mn.num.edu.committee_service.application.port.in;

import mn.num.edu.committee_service.application.dto.AssignStudentCommand;
import reactor.core.publisher.Mono;

public interface AssignStudentUseCase {
    Mono<Void> execute(AssignStudentCommand command);
}
