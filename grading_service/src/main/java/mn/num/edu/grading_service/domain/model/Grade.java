package mn.num.edu.grading_service.domain.model;

import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
public class Grade {
    private String id;
    private String thesisId;
    private String studentId;
    private String workflowId;
    private String resolutionId;
    private Double totalScore;
    private GradeStatus status;
    private LocalDateTime calculatedAt;

    public Grade(
            String id,
            String thesisId,
            String studentId,
            String workflowId,
            String resolutionId,
            Double totalScore,
            GradeStatus status,
            LocalDateTime calculatedAt
    ) {
        this.id = id;
        this.thesisId = thesisId;
        this.studentId = studentId;
        this.workflowId = workflowId;
        this.resolutionId = resolutionId;
        this.totalScore = totalScore;
        this.status = status;
        this.calculatedAt = calculatedAt;
    }

    public static Grade create(String thesisId, String studentId, String workflowId) {
        return new Grade(
                UUID.randomUUID().toString(),
                thesisId,
                studentId,
                workflowId,
                null,
                0.0,
                GradeStatus.PENDING,
                null
        );
    }

    public void updateScore(Double totalScore, GradeStatus status) {
        this.totalScore = totalScore;
        this.status = status;
        this.calculatedAt = LocalDateTime.now();
    }
}
