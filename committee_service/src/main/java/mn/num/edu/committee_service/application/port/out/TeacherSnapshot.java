package mn.num.edu.committee_service.application.port.out;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("teacher_snapshots")
public class TeacherSnapshot implements Persistable<String> {
    @Id
    @Column("teacher_id")

    private String teacherId;
    @Column("department_id")

    private String departmentId;
    @Column("active")
    private boolean active;
    @Transient
    private final boolean isNew;

    public TeacherSnapshot(String teacherId, String departmentId, boolean active) {
        this.teacherId = teacherId;
        this.departmentId = departmentId;
        this.active = active;
        this.isNew = true;
    }

    public String getTeacherId() {
        return teacherId;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public boolean isActive() {
        return active;
    }
    @Override
    public String getId() {
        return teacherId;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

}