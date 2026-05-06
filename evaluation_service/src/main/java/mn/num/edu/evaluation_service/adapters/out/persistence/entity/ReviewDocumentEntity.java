package mn.num.edu.evaluation_service.adapters.out.persistence.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("review_document")
public class ReviewDocumentEntity implements Persistable<UUID> {

    @Id
    private UUID id;
    private String defenseSessionId;
    private String thesisId;
    private String studentId;
    private String reviewerId;
    private String originalFilename;
    private String storedPath;
    private Long fileSize;
    private String mimeType;
    private BigDecimal reviewerScore;
    private LocalDateTime uploadedAt;

    @Transient
    private boolean isNew;

    public ReviewDocumentEntity() {}

    public static ReviewDocumentEntity create(String defenseSessionId, String thesisId, String studentId,
                                               String reviewerId, String originalFilename,
                                               String storedPath, Long fileSize, String mimeType,
                                               BigDecimal reviewerScore) {
        ReviewDocumentEntity e = new ReviewDocumentEntity();
        e.id = UUID.randomUUID();
        e.defenseSessionId = defenseSessionId;
        e.thesisId = thesisId;
        e.studentId = studentId;
        e.reviewerId = reviewerId;
        e.originalFilename = originalFilename;
        e.storedPath = storedPath;
        e.fileSize = fileSize;
        e.mimeType = mimeType;
        e.reviewerScore = reviewerScore;
        e.uploadedAt = LocalDateTime.now();
        e.isNew = true;
        return e;
    }

    @Override public UUID getId() { return id; }
    @Override public boolean isNew() { return isNew; }

    public String getDefenseSessionId() { return defenseSessionId; }
    public String getThesisId() { return thesisId; }
    public String getStudentId() { return studentId; }
    public String getReviewerId() { return reviewerId; }
    public String getOriginalFilename() { return originalFilename; }
    public String getStoredPath() { return storedPath; }
    public Long getFileSize() { return fileSize; }
    public String getMimeType() { return mimeType; }
    public BigDecimal getReviewerScore() { return reviewerScore; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
}
