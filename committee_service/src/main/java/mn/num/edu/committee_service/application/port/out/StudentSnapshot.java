package mn.num.edu.committee_service.application.port.out;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("student_snapshots")
public class StudentSnapshot implements Persistable<String> {

    @Id
    @Column("student_id")
    private final String studentId;

    @Column("department_id")
    private final String departmentId;

    @Column("active")
    private final boolean active;

    @Transient
    private final boolean isNew;

    public StudentSnapshot(String studentId, String departmentId, boolean active) {
        this.studentId = studentId;
        this.departmentId = departmentId;
        this.active = active;
        this.isNew = true;
    }

    @Override
    public String getId() {
        return studentId;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    public String getStudentId() {
        return studentId;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public boolean isActive() {
        return active;
    }
}