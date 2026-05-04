package mn.num.edu.committee_service.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("reviewer_assignment")
public class ReviewerAssignment implements Persistable<String> {

    @Id
    private String id;

    @Column("committee_id")
    private String committeeId;

    @Column("defense_session_id")
    private String defenseSessionId;

    @Column("student_id")
    private String studentId;

    @Column("reviewer_id")
    private String reviewerId;

    @Column("assigned_by")
    private String assignedBy;

    @Column("assigned_at")
    private LocalDateTime assignedAt;

    @Transient
    private boolean isNew;

    public ReviewerAssignment() {}

    public static ReviewerAssignment create(String committeeId, String defenseSessionId,
                                             String studentId, String reviewerId, String assignedBy) {
        ReviewerAssignment ra = new ReviewerAssignment();
        ra.id = UUID.randomUUID().toString();
        ra.committeeId = committeeId;
        ra.defenseSessionId = defenseSessionId;
        ra.studentId = studentId;
        ra.reviewerId = reviewerId;
        ra.assignedBy = assignedBy;
        ra.assignedAt = LocalDateTime.now();
        ra.isNew = true;
        return ra;
    }

    @Override public String getId() { return id; }
    @Override public boolean isNew() { return isNew; }

    public String getCommitteeId() { return committeeId; }
    public String getDefenseSessionId() { return defenseSessionId; }
    public String getStudentId() { return studentId; }
    public String getReviewerId() { return reviewerId; }
    public String getAssignedBy() { return assignedBy; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
}
