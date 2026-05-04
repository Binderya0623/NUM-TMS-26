package mn.num.edu.thesis_service.application.service;


import mn.num.edu.thesis_service.application.dto.*;
import mn.num.edu.thesis_service.application.port.in.*;
import mn.num.edu.thesis_service.application.port.out.ThesisEventPublisherPort;
import mn.num.edu.thesis_service.application.port.out.ThesisRepositoryPort;
import mn.num.edu.thesis_service.domain.event.*;
import mn.num.edu.thesis_service.domain.exception.ThesisNotFoundException;
import mn.num.edu.thesis_service.domain.model.Thesis;
import mn.num.edu.thesis_service.domain.model.ThesisStatus;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

public class ThesisApplicationService implements
        CreateThesisUseCase,
        UpdateThesisUseCase,
        ApproveThesisUseCase,
        RejectThesisUseCase,
        ChangeThesisStatusUseCase,
        GetThesisUseCase {

    private final ThesisRepositoryPort thesisRepositoryPort;
    private final ThesisEventPublisherPort eventPublisherPort;

    public ThesisApplicationService(
            ThesisRepositoryPort thesisRepositoryPort,
            ThesisEventPublisherPort eventPublisherPort
    ) {
        this.thesisRepositoryPort = thesisRepositoryPort;
        this.eventPublisherPort = eventPublisherPort;
    }

    @Override
    public Mono<ThesisResponse> create(CreateThesisCommand command) {
        Thesis thesis = Thesis.create(
                command.studentId(),
                command.titleMn(),
                command.titleEn(),
                command.description(),
                command.supervisorId(),
                command.committeeId()
        );
        return thesisRepositoryPort.save(thesis)
                .flatMap(saved -> eventPublisherPort.publishThesisCreated(
                        new ThesisCreatedEvent(
                                saved.getId(),
                                saved.getStudentId(),
                                saved.getTitleMn(),
                                saved.getSupervisorId(),
                                saved.getTitleEn(),
                                saved.getStatus().name(),
                                LocalDateTime.now()
                        )
                ).thenReturn(saved))
                .flatMap(saved -> eventPublisherPort.publishThesisStatusChanged(
                        new ThesisStatusChangedEvent(
                                saved.getId(),
                                saved.getStudentId(),
                                null,
                                saved.getStatus().name(),
                                LocalDateTime.now()
                        )
                ).thenReturn(saved))
                .map(this::toResponse);
    }

    @Override
    public Mono<ThesisResponse> update(String thesisId, UpdateThesisCommand command) {
        return thesisRepositoryPort.findById(thesisId)
                .switchIfEmpty(Mono.error(new ThesisNotFoundException("Thesis not found: " + thesisId)))
                .flatMap(thesis -> {
                    thesis.submitted();
                    thesis.update(command.titleMn(), command.titleEn(), command.description());
                    return thesisRepositoryPort.save(thesis);
                })
                .flatMap(saved -> eventPublisherPort.publishThesisUpdated(
                        new ThesisUpdatedEvent(
                                saved.getId(),
                                saved.getStudentId(),
                                saved.getTitleMn(),
                                saved.getTitleEn(),
                                saved.getDescription(),
                                LocalDateTime.now()
                        )
                ).thenReturn(saved))
                .map(this::toResponse);
    }

    @Override
    public Mono<ThesisResponse> approve(String thesisId) {
        return thesisRepositoryPort.findById(thesisId)
                .switchIfEmpty(Mono.error(new ThesisNotFoundException("Thesis not found: " + thesisId)))
                .flatMap(thesis -> {
                    ThesisStatus oldStatus = thesis.getStatus();
                    thesis.approve();

                    return thesisRepositoryPort.save(thesis)
                            .flatMap(saved ->
                                    eventPublisherPort.publishThesisApproved(
                                            new ThesisApprovedEvent(
                                                    saved.getId(),
                                                    saved.getStudentId(),
                                                    LocalDateTime.now()
                                            )
                                    ).then(
                                            eventPublisherPort.publishThesisStatusChanged(
                                                    new ThesisStatusChangedEvent(
                                                            saved.getId(),
                                                            saved.getStudentId(),
                                                            oldStatus.name(),
                                                            saved.getStatus().name(),
                                                            LocalDateTime.now()
                                                    )
                                            )
                                    ).thenReturn(saved)
                            );
                })
                .map(this::toResponse);
    }

    @Override
    public Mono<ThesisResponse> reject(String thesisId) {
        return thesisRepositoryPort.findById(thesisId)
                .switchIfEmpty(Mono.error(new ThesisNotFoundException("Thesis not found: " + thesisId)))
                .flatMap(thesis -> {
                    ThesisStatus oldStatus = thesis.getStatus();
                    thesis.reject();

                    return thesisRepositoryPort.save(thesis)
                            .flatMap(saved ->
                                    eventPublisherPort.publishThesisRejected(
                                            new ThesisRejectedEvent(
                                                    saved.getId(),
                                                    saved.getStudentId(),
                                                    LocalDateTime.now()
                                            )
                                    ).then(
                                            eventPublisherPort.publishThesisStatusChanged(
                                                    new ThesisStatusChangedEvent(
                                                            saved.getId(),
                                                            saved.getStudentId(),
                                                            oldStatus.name(),
                                                            saved.getStatus().name(),
                                                            LocalDateTime.now()
                                                    )
                                            )
                                    ).thenReturn(saved)
                            );
                })
                .map(this::toResponse);
    }

    @Override
    public Mono<ThesisResponse> changeStatus(String thesisId, ChangeThesisStatusCommand command) {
        return thesisRepositoryPort.findById(thesisId)
                .switchIfEmpty(Mono.error(new ThesisNotFoundException("Thesis not found: " + thesisId)))
                .flatMap(thesis -> {
                    ThesisStatus oldStatus = thesis.getStatus();
                    ThesisStatus newStatus = ThesisStatus.valueOf(command.newStatus().toUpperCase());

                    thesis.changeStatus(newStatus);

                    return thesisRepositoryPort.save(thesis)
                            .flatMap(saved ->
                                    eventPublisherPort.publishThesisStatusChanged(
                                            new ThesisStatusChangedEvent(
                                                    saved.getId(),
                                                    saved.getStudentId(),
                                                    oldStatus.name(),
                                                    saved.getStatus().name(),
                                                    LocalDateTime.now()
                                            )
                                    ).thenReturn(saved)
                            );
                })
                .map(this::toResponse);
    }

    @Override
    public Mono<ThesisResponse> getById(String thesisId) {
        return thesisRepositoryPort.findById(thesisId)
                .switchIfEmpty(Mono.error(new ThesisNotFoundException("Thesis not found: " + thesisId)))
                .map(this::toResponse);
    }

    @Override
    public Flux<ThesisResponse> getAll() {
        return thesisRepositoryPort.findAll()
                .map(this::toResponse);
    }

    @Override
    public Mono<ThesisResponse> getByStudentId(String studentId) {
        return thesisRepositoryPort.findByStudentId(studentId)
                .map(this::toResponse);
    }

    public Mono<Void> handleStudentRegistered(StudentRegisteredEvent event) {
        StudentRegisteredEvent.Payload payload = event.getPayload();

        return thesisRepositoryPort.findByStudentId(payload.getUserId())
                .hasElement()
                .flatMap(exists -> {
                    if (exists) return Mono.empty();

                    Thesis thesis = Thesis.create(
                            payload.getUserId(),
                            "Untitled Thesis",
                            "Untitled Thesis",
                            "Auto-created thesis draft for registered student",
                            "supervisor",
                            "Committee"
                    );
                    return thesisRepositoryPort.save(thesis).then();
                });
    }


    public Mono<Void> handleCommitteeAssigned(CommitteeAssignedEvent event) {
        return thesisRepositoryPort.findByStudentId(event.studentId())
                .switchIfEmpty(Mono.error(new ThesisNotFoundException("Student not found: " + event.studentId())))
                .flatMap(thesis -> {
                    thesis.assignCommittee(event.committeeId());
                    return thesisRepositoryPort.save(thesis).then();
                });
    }

    private ThesisResponse toResponse(Thesis thesis) {
        return new ThesisResponse(
                thesis.getId(),
                thesis.getStudentId(),
                thesis.getSupervisorId(),
                thesis.getCommitteeId(),
                thesis.getTitleMn(),
                thesis.getTitleEn(),
                thesis.getDescription(),
                thesis.getStatus().name(),
                thesis.getCreatedAt(),
                thesis.getUpdatedAt()
        );
    }
}
