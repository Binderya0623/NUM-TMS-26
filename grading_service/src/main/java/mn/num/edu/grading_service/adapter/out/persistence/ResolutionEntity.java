package mn.num.edu.grading_service.adapter.out.persistence;

import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Getter
@Table("resolutions")
public class ResolutionEntity {

    @Id
    private String id;
    private String workflowId;
    private String resolutionNumber;
    private Integer totalStudents;
    private Integer passedCount;
    private Integer failedCount;
    private LocalDateTime generatedAt;

    public ResolutionEntity() {
    }

    public ResolutionEntity(String id, String workflowId, String resolutionNumber,
                            Integer totalStudents, Integer passedCount,
                            Integer failedCount, LocalDateTime generatedAt) {
        this.id = id;
        this.workflowId = workflowId;
        this.resolutionNumber = resolutionNumber;
        this.totalStudents = totalStudents;
        this.passedCount = passedCount;
        this.failedCount = failedCount;
        this.generatedAt = generatedAt;
    }

}