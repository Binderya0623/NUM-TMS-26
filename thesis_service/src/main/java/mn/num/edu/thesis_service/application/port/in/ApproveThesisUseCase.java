package mn.num.edu.thesis_service.application.port.in;

import mn.num.edu.thesis_service.application.dto.ThesisResponse;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface ApproveThesisUseCase {
    Mono<ThesisResponse> approve(String thesisId);
}