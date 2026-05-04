package mn.num.edu.committee_service.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Table("committee_students")
public class CommitteeStudent implements Persistable<String> {

    @Id
    private final String id;

    @Column("committee_id")
    private final String committeeId;

    @Column("student_id")
    private final String studentId;

    @Transient
    private boolean isNew;

    public CommitteeStudent(String id, String committeeId, String studentId) {
        this.id = id;
        this.committeeId = committeeId;
        this.studentId = studentId;
        this.isNew = false;
    }

    public static CommitteeStudent create(String committeeId, String studentId) {
        CommitteeStudent cs = new CommitteeStudent(
                UUID.randomUUID().toString(),
                committeeId,
                studentId
        );
        cs.isNew = true;
        return cs;
    }

    public CommitteeStudent markPersisted() {
        this.isNew = false;
        return this;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    public String getCommitteeId() {
        return committeeId;
    }

    public String getStudentId() {
        return studentId;
    }
}