package mn.num.edu.workflow_service.adapters.out.persistence.entity;

import mn.num.edu.workflow_service.domain.model.WorkflowStage;
import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Persistable;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Table;

@Table("workflows")
public class WorkflowEntity implements Persistable<String> {

    @Id
    private String id;
    private String departmentId;
    private String title;
    private String status;

    @Transient
    private boolean isNew = true;

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

    public String getDepartmentId() {
        return departmentId;
    }

    public String getTitle() {
        return title;
    }

    public String getStatus() {
        return status;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setStatus(String status) {
        this.status = status;
    }

}