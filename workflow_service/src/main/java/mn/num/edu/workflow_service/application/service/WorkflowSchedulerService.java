//package mn.num.edu.workflow_service.application.service;
//
//import mn.num.edu.workflow_service.application.port.out.WorkflowEventPublisherPort;
//import mn.num.edu.workflow_service.application.port.out.WorkflowRepositoryPort;
//import mn.num.edu.workflow_service.application.port.out.WorkflowStageRepositoryPort;
//import mn.num.edu.workflow_service.domain.event.WorkflowCompletedEvent;
//import mn.num.edu.workflow_service.domain.event.WorkflowDeadlineApproachingEvent;
//import mn.num.edu.workflow_service.domain.event.WorkflowStageActivatedEvent;
//import mn.num.edu.workflow_service.domain.event.WorkflowStageClosedEvent;
//import mn.num.edu.workflow_service.domain.model.StageStatus;
//import mn.num.edu.workflow_service.domain.model.Workflow;
//import mn.num.edu.workflow_service.domain.model.WorkflowStage;
//import mn.num.edu.workflow_service.domain.model.WorkflowStatus;
//import mn.num.edu.workflow_service.domain.utils.WorkflowStageUtils;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//import reactor.core.publisher.Flux;
//import reactor.core.publisher.Mono;
//
//import java.time.Instant;
//import java.time.LocalDate;
//import java.time.temporal.ChronoUnit;
//import java.util.Comparator;
//
//@Component
//public class WorkflowSchedulerService {
//
//    private final WorkflowRepositoryPort workflowRepositoryPort;
//    private final WorkflowStageRepositoryPort stageRepositoryPort;
//    private final WorkflowEventPublisherPort eventPublisherPort;
//
//    public WorkflowSchedulerService(
//            WorkflowRepositoryPort workflowRepositoryPort,
//            WorkflowStageRepositoryPort stageRepositoryPort,
//            WorkflowEventPublisherPort eventPublisherPort
//    ) {
//        this.workflowRepositoryPort = workflowRepositoryPort;
//        this.stageRepositoryPort = stageRepositoryPort;
//        this.eventPublisherPort = eventPublisherPort;
//    }
//
//    @Scheduled(cron = "0 0 0 * * *")
//    public void runDailyWorkflowJobs() {
//        activatePlannedStages();
//        publishDeadlineApproachingEvents();
//        autoCloseAndMoveNextStage();
//    }
//
//    public void activatePlannedStages() {
//        LocalDate today = LocalDate.now();
//
//        workflowRepositoryPort.findByStatus(WorkflowStatus.ACTIVE.name())
//                .flatMap(workflow ->
//                        stageRepositoryPort.findByWorkflowId(workflow.getId())
//                                .filter(stage ->
//                                        stage.getStatus() == StageStatus.PLANNED &&
//                                                !stage.getStartDate().isAfter(today))
//                                .sort(Comparator.comparing(WorkflowStage::getStartDate))
//                                .next()
//                                .flatMap(stage -> {
//                                    stage.activate();
//                                    return stageRepositoryPort.updateStageStatus(stage.getId(), stage.getStatus().name())
//                                            .doOnSuccess(v -> eventPublisherPort.publishWorkflowStageActivated(
//                                                    new WorkflowStageActivatedEvent(
//                                                            workflow.getId(),
//                                                            stage.getId(),
//                                                            stage.getName(),
//                                                            Instant.now()
//                                                    )
//                                            ));
//                                })
//                )
//                .subscribe();
//    }
//
//    public void publishDeadlineApproachingEvents() {
//        LocalDate today = LocalDate.now();
//
//        stageRepositoryPort.findByStatus(StageStatus.ACTIVE.name())
//                .filter(stage -> {
//                    long days = ChronoUnit.DAYS.between(today, stage.getEndDate());
//                    return days >= 0 && days <= 2;
//                })
//                .flatMap(stage ->
//                        workflowRepositoryPort.findById(stage.getWorkflowId())
//                                .doOnNext(workflow -> eventPublisherPort.publishWorkflowDeadlineApproaching(
//                                        new WorkflowDeadlineApproachingEvent(
//                                                workflow.getId(),
//                                                stage.getId(),
//                                                stage.getName(),
//                                                stage.getEndDate(),
//                                                Instant.now()
//                                        )
//                                ))
//                )
//                .subscribe();
//    }
//
//    public void autoCloseAndMoveNextStage() {
//        LocalDate today = LocalDate.now();
//
//        stageRepositoryPort.findByStatus(StageStatus.ACTIVE.name())
//                .filter(stage -> today.isAfter(stage.getEndDate()))
//                .flatMap(this::closeCurrentAndActivateNext)
//                .subscribe();
//    }
//
//    private Mono<Void> closeCurrentAndActivateNext(WorkflowStage currentStage) {
//        return workflowRepositoryPort.findById(currentStage.getWorkflowId())
//                .flatMap(workflow ->
//                        stageRepositoryPort.findByWorkflowId(workflow.getId())
//                                .sort(Comparator.comparing(WorkflowStage::getStartDate))
//                                .collectList()
//                                .flatMap(stages -> {
//                                    currentStage.close();
//
//                                    Mono<Void> closeFlow = stageRepositoryPort
//                                            .updateStageStatus(currentStage.getId(), currentStage.getStatus().name())
//                                            .doOnSuccess(v -> eventPublisherPort.publishWorkflowStageClosed(
//                                                    new WorkflowStageClosedEvent(
//                                                            workflow.getId(),
//                                                            currentStage.getId(),
//                                                            currentStage.getName(),
//                                                            Instant.now()
//                                                    )
//                                            ))
//                                            .then();
//
//                                    return closeFlow.then(
//                                            Mono.defer(() -> {
//                                                var nextStageOpt = WorkflowStageUtils.findNextStage(stages, currentStage);
//
//                                                if (nextStageOpt.isPresent()) {
//                                                    WorkflowStage nextStage = nextStageOpt.get();
//
//                                                    if (nextStage.getStatus() == StageStatus.PLANNED) {
//                                                        nextStage.activate();
//
//                                                        return stageRepositoryPort
//                                                                .updateStageStatus(nextStage.getId(), nextStage.getStatus().name())
//                                                                .doOnSuccess(v -> eventPublisherPort.publishWorkflowStageActivated(
//                                                                        new WorkflowStageActivatedEvent(
//                                                                                workflow.getId(),
//                                                                                nextStage.getId(),
//                                                                                nextStage.getName(),
//                                                                                Instant.now()
//                                                                        )
//                                                                ))
//                                                                .then();
//                                                    }
//
//                                                    return Mono.empty();
//                                                } else {
//                                                    workflow.complete();
//                                                    return workflowRepositoryPort.saveWorkflow(workflow)
//                                                            .doOnSuccess(saved -> eventPublisherPort.publishWorkflowCompleted(
//                                                                    new WorkflowCompletedEvent(
//                                                                            saved.getId(),
//                                                                            saved.getDepartmentId(),
//                                                                            Instant.now()
//                                                                    )
//                                                            ))
//                                                            .then();
//                                                }
//                                            })
//                                    );
//                                })
//                );
//    }}