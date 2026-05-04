package mn.num.edu.thesis_service.application.port.out;


import mn.num.edu.thesis_service.domain.model.Thesis;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface ThesisRepositoryPort {
    Mono<Thesis> save(Thesis thesis);
    Mono<Thesis> findById(String studentId);
    Flux<Thesis> findAll();
    Mono<Thesis> findByStudentId(String studentId);
}