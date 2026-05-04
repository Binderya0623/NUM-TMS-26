package mn.num.edu.thesis_service.application.port.in;

import mn.num.edu.thesis_service.application.dto.ThesisResponse;
import mn.num.edu.thesis_service.application.dto.UpdateThesisCommand;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface UpdateThesisUseCase {
    Mono<ThesisResponse> update(String thesisId, UpdateThesisCommand command);
}