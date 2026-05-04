package mn.num.edu.grading_service.domain.model;


import lombok.Getter;

@Getter
public class ResolutionStudentResult {
    private String studentId;
    private String thesisId;
    private Double totalScore;
    private GradeStatus status;

    public ResolutionStudentResult(String studentId, String thesisId, Double totalScore, GradeStatus status) {
        this.studentId = studentId;
        this.thesisId = thesisId;
        this.totalScore = totalScore;
        this.status = status;
    }

}