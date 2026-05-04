package mn.num.edu.grading_service.domain.model;

import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class Resolution {
    private String id;
    private String workflowId;
    private String resolutionNumber;
    private int totalStudents;
    private int passedCount;
    private int failedCount;
    private LocalDateTime generatedAt;
    private List<ResolutionStudentResult> studentResults;

    public Resolution(
            String id,
            String workflowId,
            String resolutionNumber,
            int totalStudents,
            int passedCount,
            int failedCount,
            LocalDateTime generatedAt,
            List<ResolutionStudentResult> studentResults
    ) {
        this.id = id;
        this.workflowId = workflowId;
        this.resolutionNumber = resolutionNumber;
        this.totalStudents = totalStudents;
        this.passedCount = passedCount;
        this.failedCount = failedCount;
        this.generatedAt = generatedAt;
        this.studentResults = studentResults;
    }

    public static Resolution create(
            String workflowId,
            String resolutionNumber,
            int totalStudents,
            int passedCount,
            int failedCount,
            List<ResolutionStudentResult> studentResults
    ) {
        return new Resolution(
                java.util.UUID.randomUUID().toString(),
                workflowId,
                resolutionNumber,
                totalStudents,
                passedCount,
                failedCount,
                LocalDateTime.now(),
                studentResults
        );
    }

}
