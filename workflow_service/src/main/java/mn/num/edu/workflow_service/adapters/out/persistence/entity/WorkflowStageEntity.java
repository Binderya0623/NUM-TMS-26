package mn.num.edu.workflow_service.adapters.out.persistence.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;

@Table("workflow_stages")
public class WorkflowStageEntity implements Persistable<String> {

    @Id
    private String id;

    @Column("workflow_id")
    private String workflowId;

    private String name;

    @Column("start_date")
    private LocalDate startDate;

    @Column("end_date")
    private LocalDate endDate;

    @Column("weight_percent")
    private double weightPercent;

    private String status;

    @Column("stage_order")
    private int stageOrder;

    @Transient
    private boolean isNew ;

    public WorkflowStageEntity() {
    }

    public WorkflowStageEntity(String id, String workflowId, String name,
                               LocalDate startDate, LocalDate endDate,
                               double weightPercent, String status, int stageOrder) {
        this.id = id;
        this.workflowId = workflowId;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.weightPercent = weightPercent;
        this.status = status;
        this.stageOrder = stageOrder;
        this.isNew = true;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    public void markNotNew() {
        this.isNew = false;
    }

    public String getWorkflowId() {
        return workflowId;
    }

    public String getName() {
        return name;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public double getWeightPercent() {
        return weightPercent;
    }

    public String getStatus() {
        return status;
    }

    public int getStageOrder() {
        return stageOrder;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setWorkflowId(String workflowId) {
        this.workflowId = workflowId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public void setWeightPercent(double weightPercent) {
        this.weightPercent = weightPercent;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setStageOrder(int stageOrder) {
        this.stageOrder = stageOrder;
    }
}