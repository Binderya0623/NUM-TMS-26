package mn.num.edu.thesis_service.application.port.in;

import mn.num.edu.thesis_service.application.dto.ThesisResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface GetThesisUseCase {
    Mono<ThesisResponse> getById(String thesisId);
    Flux<ThesisResponse> getAll();
    Mono<ThesisResponse> getByStudentId(String studentId);
}