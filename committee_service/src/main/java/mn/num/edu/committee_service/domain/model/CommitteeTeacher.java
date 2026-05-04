package mn.num.edu.committee_service.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Table("committee_teachers")
public class CommitteeTeacher implements Persistable<String> {

    @Id
    private final String id;

    @Column("committee_id")
    private final String committeeId;

    @Column("teacher_id")
    private final String teacherId;

    @Column("committee_role")
    private final CommitteeRole role;

    @Transient
    private boolean isNew;

    public CommitteeTeacher(String id, String committeeId, String teacherId, CommitteeRole role) {
        this.id = id;
        this.committeeId = committeeId;
        this.teacherId = teacherId;
        this.role = role;
        this.isNew = false;
    }

    public static CommitteeTeacher create(String committeeId, String teacherId, CommitteeRole role) {
        CommitteeTeacher ct = new CommitteeTeacher(
                UUID.randomUUID().toString(),
                committeeId,
                teacherId,
                role
        );
        ct.isNew = true;
        return ct;
    }

    public CommitteeTeacher markPersisted() {
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

    public String getTeacherId() {
        return teacherId;
    }

    public CommitteeRole getRole() {
        return role;
    }
}