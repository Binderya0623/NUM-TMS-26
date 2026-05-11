package mn.num.edu.committee_service.application.service;

import mn.num.edu.committee_service.application.dto.AssignStudentCommand;
import mn.num.edu.committee_service.application.port.in.AssignStudentUseCase;
import mn.num.edu.committee_service.application.port.out.CommitteeEventPublisherPort;
import mn.num.edu.committee_service.application.port.out.CommitteeRepositoryPort;
import mn.num.edu.committee_service.application.port.out.CommitteeStudentRepositoryPort;
import mn.num.edu.committee_service.domain.event.StudentAssignedEvent;
import mn.num.edu.committee_service.domain.model.CommitteeStudent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
public class AssignStudentService implements AssignStudentUseCase {

    private static final Logger log = LoggerFactory.getLogger(AssignStudentService.class);

    private final CommitteeStudentRepositoryPort repository;
    private final CommitteeRepositoryPort committeeRepository;
    private final CommitteeEventPublisherPort publisher;

    public AssignStudentService(
            CommitteeStudentRepositoryPort repository,
            CommitteeRepositoryPort committeeRepository,
            CommitteeEventPublisherPort publisher
    ) {
        this.repository = repository;
        this.committeeRepository = committeeRepository;
        this.publisher = publisher;
    }

    @Override
    public Mono<Void> execute(AssignStudentCommand command) {
        return repository.save(
                CommitteeStudent.create(
                        command.committeeId(),
                        command.studentId()
                )
        ).doOnSuccess(saved ->
                // Fire-and-forget: DB row is committed; Kafka failure must not block the response.
                // Look up the committee name so the notification message reads like a name, not a UUID.
                committeeRepository.findById(saved.getCommitteeId())
                        .map(c -> c.getName())
                        .defaultIfEmpty("")
                        .flatMap(name -> publisher.publishStudentAssigned(
                                new StudentAssignedEvent(
                                        saved.getCommitteeId(),
                                        name,
                                        saved.getStudentId(),
                                        command.departmentId(),
                                        Instant.now()
                                )
                        ))
                        .subscribe(
                                null,
                                e -> log.warn("Kafka publish failed for student assignment committeeId={} studentId={}",
                                        saved.getCommitteeId(), saved.getStudentId(), e)
                        )
        ).then();
    }

}
