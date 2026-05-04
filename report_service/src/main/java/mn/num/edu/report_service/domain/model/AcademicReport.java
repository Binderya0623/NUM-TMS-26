package mn.num.edu.report_service.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class AcademicReport {
    private UUID id;
    private String departmentId;
    private String academicYear;
    private int totalStudents;
    private int passedStudents;
    private int failedStudents;
    private Double averageScore;
    private LocalDateTime generatedAt;
    private String generatedBy;

    public AcademicReport(UUID id, String departmentId, String academicYear,
                          int totalStudents, int passedStudents, int failedStudents,
                          Double averageScore, LocalDateTime generatedAt, String generatedBy) {
        this.id = id;
        this.departmentId = departmentId;
        this.academicYear = academicYear;
        this.totalStudents = totalStudents;
        this.passedStudents = passedStudents;
        this.failedStudents = failedStudents;
        this.averageScore = averageScore;
        this.generatedAt = generatedAt;
        this.generatedBy = generatedBy;
    }

    public static AcademicReport create(String departmentId, String academicYear,
                                        int total, int passed, int failed, Double avgScore) {
        return new AcademicReport(UUID.randomUUID(), departmentId, academicYear,
                total, passed, failed, avgScore, LocalDateTime.now(), "system");
    }

    public UUID getId() { return id; }
    public String getDepartmentId() { return departmentId; }
    public String getAcademicYear() { return academicYear; }
    public int getTotalStudents() { return totalStudents; }
    public int getPassedStudents() { return passedStudents; }
    public int getFailedStudents() { return failedStudents; }
    public Double getAverageScore() { return averageScore; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public String getGeneratedBy() { return generatedBy; }
}
