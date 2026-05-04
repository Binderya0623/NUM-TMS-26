package mn.num.edu.thesis_service.adapter.out.persistence;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("report_file")
public class ReportFileEntity implements Persistable<String> {

    @Id
    private String id;
    private String reportId;
    private String originalFilename;
    private String storedPath;
    private Long fileSize;
    private String mimeType;
    private LocalDateTime uploadedAt;

    @Transient
    private boolean isNew;

    public ReportFileEntity() {}

    @Override public String getId() { return id; }
    @Override public boolean isNew() { return isNew; }

    public void setId(String id) { this.id = id; }
    public void setNew(boolean n) { this.isNew = n; }
    public String getReportId() { return reportId; }
    public void setReportId(String reportId) { this.reportId = reportId; }
    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
    public String getStoredPath() { return storedPath; }
    public void setStoredPath(String storedPath) { this.storedPath = storedPath; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
