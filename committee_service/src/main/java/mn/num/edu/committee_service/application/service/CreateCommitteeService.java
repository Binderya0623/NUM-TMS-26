package mn.num.edu.committee_service.application.service;

import mn.num.edu.committee_service.application.dto.CreateCommitteeCommand;
import mn.num.edu.committee_service.application.port.in.CreateCommitteeUseCase;
import mn.num.edu.committee_service.application.port.out.CommitteeEventPublisherPort;
import mn.num.edu.committee_service.application.port.out.CommitteeRepositoryPort;
import mn.num.edu.committee_service.domain.event.CommitteeCreatedEvent;
import mn.num.edu.committee_service.domain.model.Committee;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
public class CreateCommitteeService implements CreateCommitteeUseCase {

    private final CommitteeRepositoryPort repository;
    private final CommitteeEventPublisherPort eventPublisher;

    public CreateCommitteeService(CommitteeRepositoryPort repository,
                                  CommitteeEventPublisherPort eventPublisher) {
        this.repository = repository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public Mono<Committee> execute(CreateCommitteeCommand command) {
        Committee committee = Committee.create(
                command.departmentId(),
                command.name(),
                command.defenseType()
        );

        return repository.save(committee)
                .flatMap(savedCommittee -> {
                    CommitteeCreatedEvent event = new CommitteeCreatedEvent(
                            savedCommittee.getId(),
                            savedCommittee.getDepartmentId(),
                            savedCommittee.getName(),
                            savedCommittee.getDefenseType(),
                            Instant.now()
                    );

                    return eventPublisher.publishCommitteeCreate(event)
                            .thenReturn(savedCommittee);
                });
    }

    @Override
    public Flux<Committee> findAll() {
        return repository.findAll();
    }

    @Override
    public Mono<Committee> findById(String id) {
        return repository.findById(id);
    }
}