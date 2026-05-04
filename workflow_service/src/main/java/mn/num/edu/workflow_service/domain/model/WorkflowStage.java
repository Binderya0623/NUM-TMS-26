package mn.num.edu.workflow_service.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class WorkflowStage {
    private String id;
    private String workflowId;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private double weightPercent;
    private StageStatus status;
    int stageOrder;

    public WorkflowStage(
            String id,
            String workflowId,
            String name,
            LocalDate startDate,
            LocalDate endDate,
            double weightPercent,
            StageStatus status,
            int stageOrder
    ) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Stage name хоосон байж болохгүй");
        }
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Stage огноо заавал байна");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date start date-аас өмнө байж болохгүй");
        }
        if (weightPercent <= 0 || weightPercent > 100) {
            throw new IllegalArgumentException("Stage хувь 0-100 хооронд байна");
        }

        this.id = id;
        this.workflowId = workflowId;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.weightPercent = weightPercent;
        this.status = status;
        this.stageOrder = stageOrder;
    }

    public void activate() {
        if (this.status == StageStatus.CLOSED) {
            throw new IllegalStateException("Closed stage-ийг дахин идэвхжүүлж болохгүй");
        }
        this.status = StageStatus.ACTIVE;
    }

    public void close() {
        if (this.status == StageStatus.CLOSED) {
            throw new IllegalStateException("Stage аль хэдийн хаагдсан");
        }
        this.status = StageStatus.CLOSED;
    }

    public boolean isDateInRange(LocalDate date) {
        return (date.isEqual(startDate) || date.isAfter(startDate))
                && (date.isEqual(endDate) || date.isBefore(endDate));
    }

    public String getId() { return id; }
    public String getWorkflowId() { return workflowId; }
    public String getName() { return name; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public double getWeightPercent() { return weightPercent; }
    public StageStatus getStatus() { return status; }
    public int getStageOrder() { return stageOrder; }
}