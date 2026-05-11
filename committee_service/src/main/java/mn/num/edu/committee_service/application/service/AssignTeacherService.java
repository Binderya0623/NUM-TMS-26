package mn.num.edu.committee_service.application.service;

import mn.num.edu.committee_service.application.dto.AssignTeacherCommand;
import mn.num.edu.committee_service.application.port.in.AssignTeacherUseCase;
import mn.num.edu.committee_service.application.port.out.CommitteeEventPublisherPort;
import mn.num.edu.committee_service.application.port.out.CommitteeRepositoryPort;
import mn.num.edu.committee_service.application.port.out.CommitteeTeacherRepositoryPort;
import mn.num.edu.committee_service.application.port.out.TeacherSnapshotRepositoryPort;
import mn.num.edu.committee_service.domain.event.TeacherAssignedEvent;
import mn.num.edu.committee_service.domain.model.CommitteeRole;
import mn.num.edu.committee_service.domain.model.CommitteeTeacher;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.UUID;

@Service
public class AssignTeacherService implements AssignTeacherUseCase {


    public AssignTeacherService(
            CommitteeRepositoryPort committeeRepositoryPort, CommitteeTeacherRepositoryPort committeeTeacherRepositoryPort, TeacherSnapshotRepositoryPort teacherSnapshotRepositoryPort, CommitteeEventPublisherPort committeeEventPublisherPort
    ) {

        this.committeeRepositoryPort = committeeRepositoryPort;
        this.committeeTeacherRepositoryPort = committeeTeacherRepositoryPort;
        this.teacherSnapshotRepositoryPort = teacherSnapshotRepositoryPort;
        this.committeeEventPublisherPort = committeeEventPublisherPort;
    }

    private final CommitteeRepositoryPort committeeRepositoryPort;
    private final CommitteeTeacherRepositoryPort committeeTeacherRepositoryPort;
    private final TeacherSnapshotRepositoryPort teacherSnapshotRepositoryPort;
    private final CommitteeEventPublisherPort committeeEventPublisherPort;

    @Override
    public Mono<Void> execute(AssignTeacherCommand command) {
        return committeeRepositoryPort.findById(String.valueOf(command.committeeId()))
                .switchIfEmpty(Mono.error(new RuntimeException("Committee not found")))
                .flatMap(committee ->
                        teacherSnapshotRepositoryPort.findByTeacherId(command.teacherId())
                                .switchIfEmpty(Mono.error(new RuntimeException("Teacher not found")))
                                .flatMap(teacher -> {
                                    if (!teacher.isActive()) {
                                        return Mono.error(new RuntimeException("Teacher is inactive"));
                                    }

                                    if (!committee.getDepartmentId().equals(teacher.getDepartmentId())) {
                                        return Mono.error(new RuntimeException("Teacher department mismatch"));
                                    }

                                    return validateCommitteeRole(command, committee.getId())
                                            .then(committeeTeacherRepositoryPort.save(
                                                    CommitteeTeacher.create(
                                                            committee.getId(),
                                                            command.teacherId(),
                                                            command.role()
                                                    )
                                            ))
                                            .flatMap(saved -> committeeEventPublisherPort.publishTeacherAssigned(
                                                    new TeacherAssignedEvent(
                                                            saved.getCommitteeId(),
                                                            committee.getName(),
                                                            saved.getTeacherId(),
                                                            saved.getRole(),
                                                            committee.getDepartmentId(),
                                                            Instant.now()
                                                    )
                                            ));
                                })
                )
                .then();
    }

    private Mono<Void> validateCommitteeRole(AssignTeacherCommand command, String committeeId) {
        if (command.role() == CommitteeRole.SECRETARY) {
            return committeeTeacherRepositoryPort.existsByCommitteeIdAndRole(committeeId, CommitteeRole.SECRETARY)
                    .flatMap(exists -> exists
                            ? Mono.error(new RuntimeException("Secretary already assigned"))
                            : Mono.empty());
        }

        if (command.role() == CommitteeRole.SENIOR || command.role() == CommitteeRole.HEAD) {
            return committeeTeacherRepositoryPort.existsByCommitteeIdAndRole(committeeId, CommitteeRole.HEAD)
                    .flatMap(headExists -> headExists
                            ? Mono.just(headExists)
                            : committeeTeacherRepositoryPort.existsByCommitteeIdAndRole(committeeId, CommitteeRole.SENIOR))
                    .flatMap(exists -> exists
                            ? Mono.error(new RuntimeException("HEAD/Senior already assigned to this committee"))
                            : Mono.empty());
        }

        return Mono.empty();
    }
}
