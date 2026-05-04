package mn.num.edu.thesis_service.application.port.in;

import mn.num.edu.thesis_service.application.dto.CreateThesisCommand;
import mn.num.edu.thesis_service.application.dto.ThesisResponse;
import reactor.core.publisher.Mono;

public interface CreateThesisUseCase {
    Mono<ThesisResponse> create(CreateThesisCommand command);
}
