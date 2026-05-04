package mn.num.edu.committee_service.application.port.in;

import mn.num.edu.committee_service.application.dto.CreateCommitteeCommand;
import mn.num.edu.committee_service.domain.model.Committee;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface CreateCommitteeUseCase {
    Mono<Committee> execute(CreateCommitteeCommand command);
    Flux<Committee> findAll();
    Mono<Committee> findById(String id);
}