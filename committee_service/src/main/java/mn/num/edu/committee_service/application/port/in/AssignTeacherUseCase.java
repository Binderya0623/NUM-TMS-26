package mn.num.edu.committee_service.application.port.in;

import mn.num.edu.committee_service.application.dto.AssignTeacherCommand;
import mn.num.edu.committee_service.domain.model.Committee;
import reactor.core.publisher.Mono;

public interface AssignTeacherUseCase {
    Mono<Void> execute(AssignTeacherCommand command);
}
