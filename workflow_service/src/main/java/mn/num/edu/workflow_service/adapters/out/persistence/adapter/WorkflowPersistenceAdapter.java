package mn.num.edu.workflow_service.adapters.out.persistence.adapter;

import mn.num.edu.workflow_service.adapters.out.persistence.entity.WorkflowEntity;
import mn.num.edu.workflow_service.adapters.out.persistence.entity.WorkflowStageEntity;
import mn.num.edu.workflow_service.adapters.out.persistence.repository.SpringDataWorkflowRepository;
import mn.num.edu.workflow_service.adapters.out.persistence.repository.SpringDataWorkflowStageRepository;
import mn.num.edu.workflow_service.application.port.out.WorkflowRepositoryPort;
import mn.num.edu.workflow_service.application.port.out.WorkflowStageRepositoryPort;
import mn.num.edu.workflow_service.domain.model.StageStatus;
import mn.num.edu.workflow_service.domain.model.Workflow;
import mn.num.edu.workflow_service.domain.model.WorkflowStage;
import mn.num.edu.workflow_service.domain.model.WorkflowStatus;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class WorkflowPersistenceAdapter implements WorkflowRepositoryPort, WorkflowStageRepositoryPort {

    private final SpringDataWorkflowRepository workflowRepository;
    private final SpringDataWorkflowStageRepository stageRepository;

    public WorkflowPersistenceAdapter(SpringDataWorkflowRepository workflowRepository,
                                      SpringDataWorkflowStageRepository stageRepository) {
        this.workflowRepository = workflowRepository;
        this.stageRepository = stageRepository;
    }

    @Override
    public Mono<Workflow> saveWorkflow(Workflow workflow) {

        WorkflowEntity entity = new WorkflowEntity();
        entity.setId(workflow.getId());
        entity.setDepartmentId(workflow.getDepartmentId());
        entity.setTitle(workflow.getTitle());
        entity.setStatus(workflow.getStatus().name());

        return workflowRepository.save(entity)
                .map(saved -> new Workflow(
                        saved.getId(),
                        saved.getDepartmentId(),
                        saved.getTitle(),
                        WorkflowStatus.valueOf(saved.getStatus())
                ));
    }



    @Override
    public Mono<Workflow> findById(String workflowId) {
        return null;
    }


    @Override
    public Mono<Workflow> findWorkflowById(String id) {
        return workflowRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Mono<WorkflowStage> findStageById(String stageId) {
        return stageRepository.findById(stageId).map(this::toDomainStage);
    }

    @Override
    public Flux<WorkflowEntity> findAll() {
        return workflowRepository.findAll();
    }

    @Override
    public Mono<Workflow> findByDepartmentId(String departmentId) {
        return workflowRepository.findByDepartmentId(departmentId).map(this::toDomain);
    }

    @Override
    public Mono<WorkflowStage> saveStage(WorkflowStage stage) {
        WorkflowStageEntity entity = new WorkflowStageEntity(
                stage.getId(),
                stage.getWorkflowId(),
                stage.getName(),
                stage.getStartDate(),
                stage.getEndDate(),
                stage.getWeightPercent(),
                stage.getStatus().name(),
                stage.getStageOrder()
        );
        return stageRepository.save(entity).map(this::toDomainStage);
    }

    @Override
    public Flux<WorkflowStage> findByWorkflowId(String workflowId) {
        return stageRepository.findByWorkflowId(workflowId).map(this::toDomainStage);
    }



    @Override
    public Mono<Void> updateStageStatus(String stageId, String status) {
        return stageRepository.findById(stageId)
                .flatMap(entity -> {
                    entity.setStatus(status);
                    return stageRepository.save(entity);
                })
                .then();
    }

    private Workflow toDomain(WorkflowEntity entity) {
        return new Workflow(
                entity.getId(),
                entity.getDepartmentId(),
                entity.getTitle(),
                WorkflowStatus.valueOf(entity.getStatus())
        );
    }

    private WorkflowStage toDomainStage(WorkflowStageEntity entity) {
        return new WorkflowStage(
                entity.getId(),
                entity.getWorkflowId(),
                entity.getName(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getWeightPercent(),
                StageStatus.valueOf(entity.getStatus()),
                entity.getStageOrder()
        );
    }
}