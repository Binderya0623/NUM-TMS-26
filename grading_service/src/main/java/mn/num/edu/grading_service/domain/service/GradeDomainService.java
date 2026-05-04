package mn.num.edu.grading_service.domain.service;

import mn.num.edu.grading_service.domain.model.GradeStatus;

public class GradeDomainService {

    private final double passThreshold;

    public GradeDomainService(double passThreshold) {
        this.passThreshold = passThreshold;
    }

    public double calculateTotalScore(double stageScoresSum) {
        return Math.min(stageScoresSum, 100.0);
    }

    public GradeStatus determineStatus(double totalScore) {
        return totalScore >= passThreshold ? GradeStatus.PASSED : GradeStatus.FAILED;
    }
    public double calculateFinalScore(double totalScore) {
        return Math.min(totalScore, 100.0);
    }

    public GradeStatus resolveStatus(double finalScore) {
        return finalScore >= passThreshold
                ? GradeStatus.PASSED
                : GradeStatus.FAILED;
    }
}