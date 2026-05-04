package mn.num.edu.workflow_service.application.service;

import mn.num.edu.workflow_service.application.dto.CreateWorkflowCommand;
import mn.num.edu.workflow_service.application.dto.CreateWorkflowStageCommand;
import mn.num.edu.workflow_service.application.dto.WorkflowResponse;
import mn.num.edu.workflow_service.application.port.in.AddWorkflowStageUseCase;
import mn.num.edu.workflow_service.application.port.in.ActivateStageUseCase;
import mn.num.edu.workflow_service.application.port.in.CloseStageUseCase;
import mn.num.edu.workflow_service.application.port.in.CreateWorkflowUseCase;
import mn.num.edu.workflow_service.application.port.out.WorkflowEventPublisherPort;
import mn.num.edu.workflow_service.application.port.out.WorkflowRepositoryPort;
import mn.num.edu.workflow_service.application.port.out.WorkflowStageRepositoryPort;
import mn.num.edu.workflow_service.domain.event.*;
import mn.num.edu.workflow_service.domain.exception.WorkflowNotFoundException;
import mn.num.edu.workflow_service.domain.model.*;

import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class WorkflowApplicationService implements
        CreateWorkflowUseCase,
        AddWorkflowStageUseCase,
        ActivateStageUseCase,
        CloseStageUseCase {

    private final WorkflowRepositoryPort workflowRepositoryPort;
    private final WorkflowStageRepositoryPort stageRepositoryPort;
    private final WorkflowEventPublisherPort eventPublisherPort;

    public WorkflowApplicationService(
            WorkflowRepositoryPort workflowRepositoryPort,
            WorkflowStageRepositoryPort stageRepositoryPort,
            WorkflowEventPublisherPort eventPublisherPort
    ) {
        this.workflowRepositoryPort = workflowRepositoryPort;
        this.stageRepositoryPort = stageRepositoryPort;
        this.eventPublisherPort = eventPublisherPort;
    }

    @Override
    public Mono<WorkflowResponse> createWorkflow(CreateWorkflowCommand command) {
        Workflow workflow = new Workflow(
                UUID.randomUUID().toString(),
                command.departmentId(),
                command.title(),
                WorkflowStatus.DRAFT
        );

        return workflowRepositoryPort.saveWorkflow(workflow)
                .doOnSuccess(saved -> eventPublisherPort.publishWorkflowCreated(
                        new WorkflowCreatedEvent(
                                saved.getId(),
                                saved.getDepartmentId(),
                                saved.getTitle(),
                                Instant.now()
                        )
                ))
                .map(this::toResponseWithoutStages);
    }

    @Override
    public Mono<WorkflowResponse> addStage(String workflowId, CreateWorkflowStageCommand command) {
        return workflowRepositoryPort.findWorkflowById(workflowId)
                .switchIfEmpty(Mono.error(new WorkflowNotFoundException("Workflow олдсонгүй")))
                .flatMap(workflow ->
                        stageRepositoryPort.findByWorkflowId(workflowId)
                                .collectList()
                                .flatMap(existingStages -> {
                                    existingStages.forEach(workflow::addStage);

                                    WorkflowStage newStage = new WorkflowStage(
                                            UUID.randomUUID().toString(),
                                            workflowId,
                                            command.name(),
                                            command.startDate(),
                                            command.endDate(),
                                            command.weightPercent(),
                                            StageStatus.PLANNED,
                                            command.stageOrder()
                                    );

                                    workflow.addStage(newStage);

                                    return stageRepositoryPort.saveStage(newStage)
                                            .thenReturn(workflow)
                                            .doOnSuccess(wf -> eventPublisherPort.publishWorkflowStageCreated(
                                                    new WorkflowStageCreatedEvent(
                                                            wf.getId(),
                                                            newStage.getId(),
                                                            newStage.getName(),
                                                            newStage.getStartDate(),
                                                            newStage.getEndDate(),
                                                            newStage.getWeightPercent(),
                                                            Instant.now()
                                                    )
                                            ));
                                })
                )
                .flatMap(this::loadResponse);
    }

    @Override
    public Mono<WorkflowResponse> activateStage(String workflowId, String stageId) {
        return stageRepositoryPort.findStageById(stageId)
                .switchIfEmpty(Mono.error(new WorkflowNotFoundException("Stage олдсонгүй")))
                .flatMap(stage -> {
                    stage.activate();
                    return stageRepositoryPort.updateStageStatus(stageId, stage.getStatus().name())
                            .then(workflowRepositoryPort.findWorkflowById(workflowId))
                            .doOnSuccess(workflow -> eventPublisherPort.publishWorkflowStageActivated(
                                    new WorkflowStageActivatedEvent(
                                            workflowId,
                                            stage.getId(),
                                            stage.getName(),
                                            Instant.now()
                                    )
                            ));
                })
                .flatMap(this::loadResponse);
    }

    @Override
    public Mono<WorkflowResponse> closeStage(String workflowId, String stageId) {
        return stageRepositoryPort.findStageById(stageId)
                .switchIfEmpty(Mono.error(new WorkflowNotFoundException("Stage олдсонгүй")))
                .flatMap(stage -> {
                    stage.close();
                    return stageRepositoryPort.updateStageStatus(stageId, stage.getStatus().name())
                            .then(workflowRepositoryPort.findWorkflowById(workflowId))
                            .doOnSuccess(workflow -> eventPublisherPort.publishWorkflowStageClosed(
                                    new WorkflowStageClosedEvent(
                                            workflowId,
                                            stage.getId(),
                                            stage.getName(),
                                            Instant.now()
                                    )
                            ));
                })
                .flatMap(workflow ->
                        stageRepositoryPort.findByWorkflowId(workflowId)
                                .collectList()
                                .flatMap(stages -> {
                                    boolean allClosed = stages.stream()
                                            .allMatch(s -> s.getStatus() == StageStatus.CLOSED);

                                    if (allClosed) {
                                        workflow.complete();
                                        return workflowRepositoryPort.saveWorkflow(workflow)
                                                .doOnSuccess(saved -> eventPublisherPort.publishWorkflowCompleted(
                                                        new WorkflowCompletedEvent(
                                                                saved.getId(),
                                                                saved.getDepartmentId(),
                                                                Instant.now()
                                                        )
                                                ));
                                    }
                                    return Mono.just(workflow);
                                })
                )
                .flatMap(this::loadResponse);
    }

    private Mono<WorkflowResponse> loadResponse(Workflow workflow) {
        return stageRepositoryPort.findByWorkflowId(workflow.getId())
                .collectList()
                .map(stages -> new WorkflowResponse(
                        workflow.getId(),
                        workflow.getDepartmentId(),
                        workflow.getTitle(),
                        workflow.getStatus().name(),
                        stages.stream()
                                .map(s -> new WorkflowResponse.StageItem(
                                        s.getId(),
                                        s.getName(),
                                        s.getStartDate(),
                                        s.getEndDate(),
                                        s.getWeightPercent(),
                                        s.getStatus().name()
                                ))
                                .toList()
                ));
    }

    private WorkflowResponse toResponseWithoutStages(Workflow workflow) {
        return new WorkflowResponse(
                workflow.getId(),
                workflow.getDepartmentId(),
                workflow.getTitle(),
                workflow.getStatus().name(),
                List.of()
        );
    }
}