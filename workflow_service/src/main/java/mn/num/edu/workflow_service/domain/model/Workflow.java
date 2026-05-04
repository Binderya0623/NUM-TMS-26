package mn.num.edu.workflow_service.domain.model;

import mn.num.edu.workflow_service.domain.exception.WorkflowValidationException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public class Workflow {
    private String id;
    private String departmentId;
    private String name;
    private WorkflowStatus status;
    private final List<WorkflowStage> stages = new ArrayList<>();

    public Workflow(String id, String departmentId, String name, WorkflowStatus status) {
        if (departmentId == null) {
            throw new IllegalArgumentException("departmentId хоосон байж болохгүй");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("workflow name хоосон байж болохгүй");
        }
        this.id = id;
        this.departmentId = departmentId;
        this.name = name;
        this.status = status;
    }

    public void addStage(WorkflowStage stage) {
        if (!stage.getWorkflowId().equals(this.id)) {
            throw new WorkflowValidationException("Stage workflowId буруу байна");
        }

        for (WorkflowStage existing : stages) {
            boolean overlaps =
                    !stage.getEndDate().isBefore(existing.getStartDate()) &&
                            !stage.getStartDate().isAfter(existing.getEndDate());

            if (overlaps) {
                throw new WorkflowValidationException(
                        "Stage date range давхцаж байна: " + existing.getName()
                );
            }
        }

        stages.add(stage);
        stages.sort(Comparator.comparing(WorkflowStage::getStartDate));

        double total = stages.stream()
                .mapToDouble(WorkflowStage::getWeightPercent)
                .sum();

        if (total > 100.0) {
            stages.remove(stage);
            throw new WorkflowValidationException("Нийт stage-ийн хувь 100-аас их байж болохгүй. Одоогийн нийлбэр=" + total);
        }
    }

    public void validateTotalWeight() {
        double total = stages.stream()
                .mapToDouble(WorkflowStage::getWeightPercent)
                .sum();

        if (total>100.0) {
            throw new WorkflowValidationException("Нийт stage-ийн хувь 100 байх ёстой. Одоогийн нийлбэр=" + total);
        }
    }

    public void activate() {
        if (stages.isEmpty()) {
            throw new WorkflowValidationException("Workflow stage-гүй тул идэвхжүүлэх боломжгүй");
        }
        validateTotalWeight();
        this.status = WorkflowStatus.ACTIVE;
    }

    public void complete() {
        boolean allClosed = stages.stream().allMatch(s -> s.getStatus() == StageStatus.CLOSED);
        if (!allClosed) {
            throw new WorkflowValidationException("Бүх stage хаагдаагүй байхад workflow complete хийж болохгүй");
        }
        this.status = WorkflowStatus.COMPLETED;
    }

    public String getId() { return id; }
    public String getDepartmentId() { return departmentId; }
    public String getTitle() { return name; }
    public WorkflowStatus getStatus() { return status; }
    public List<WorkflowStage> getStages() { return stages; }
}