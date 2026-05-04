package mn.num.edu.grading_service.adapter.out.persistence;

import lombok.Getter;
import mn.num.edu.grading_service.domain.model.GradeStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Getter
@Table("grades")
public class GradeEntity {
    @Id
    private  String id;
    private  String thesisId;
    private  String studentId;
    private  String workflowId;
    private  String resolutionId;
    private Double totalScore;
    private GradeStatus status;
    private LocalDateTime calculatedAt;

    public GradeEntity() {}

    public GradeEntity( String id,  String thesisId,  String studentId,  String workflowId, String resolutionId,
                       Double totalScore, GradeStatus status, LocalDateTime calculatedAt) {
        this.id = id;
        this.thesisId = thesisId;
        this.studentId = studentId;
        this.workflowId = workflowId;
        this.resolutionId = resolutionId;
        this.totalScore = totalScore;
        this.status = status;
        this.calculatedAt = calculatedAt;
    }

}