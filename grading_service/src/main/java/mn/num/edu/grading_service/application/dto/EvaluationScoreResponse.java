package mn.num.edu.grading_service.application.dto;


public class EvaluationScoreResponse {
    private  String stageId;
    private Double stageScore;

    public EvaluationScoreResponse() {
    }

    public  String getStageId() { return stageId; }
    public void setStageId( String stageId) { this.stageId = stageId; }

    public Double getStageScore() { return stageScore; }
    public void setStageScore(Double stageScore) { this.stageScore = stageScore; }
}