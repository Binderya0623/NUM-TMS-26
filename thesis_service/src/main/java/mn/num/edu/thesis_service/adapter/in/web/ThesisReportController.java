package mn.num.edu.thesis_service.adapter.in.web;

import mn.num.edu.thesis_service.adapter.out.persistence.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/thesis-reports")
public class ThesisReportController {

    private static final Logger log = LoggerFactory.getLogger(ThesisReportController.class);
    /** Topic name notification_service listens on for student report submissions. */
    private static final String REPORT_SUBMITTED_TOPIC = "report-submitted";

    private final ThesisReportR2dbcRepository reportRepo;
    private final ReportFileR2dbcRepository fileRepo;
    private final ThesisR2dbcRepository thesisRepo;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.upload.dir:${java.io.tmpdir}/thesis-uploads/reports}")
    private String uploadDir;

    public ThesisReportController(ThesisReportR2dbcRepository reportRepo,
                                   ReportFileR2dbcRepository fileRepo,
                                   ThesisR2dbcRepository thesisRepo,
                                   KafkaTemplate<String, Object> kafkaTemplate) {
        this.reportRepo = reportRepo;
        this.fileRepo = fileRepo;
        this.thesisRepo = thesisRepo;
        this.kafkaTemplate = kafkaTemplate;
    }

    /** Resolve thesisId: use provided value, or look up/auto-create for studentId. */
    private Mono<String> resolveThesisId(String thesisId, String studentId) {
        if (thesisId != null && !thesisId.isBlank()) return Mono.just(thesisId);
        if (studentId == null || studentId.isBlank()) return Mono.error(new IllegalArgumentException("studentId is required"));
        return thesisRepo.findByStudentId(studentId)
                .map(ThesisEntity::getId)
                .switchIfEmpty(Mono.defer(() -> {
                    ThesisEntity t = new ThesisEntity(
                            java.util.UUID.randomUUID().toString(),
                            studentId, null, null, null, null, null,
                            "ACTIVE", LocalDateTime.now(), LocalDateTime.now()
                    );
                    t.markNew();
                    return thesisRepo.save(t).map(ThesisEntity::getId);
                }));
    }

    @GetMapping
    public Flux<ThesisReportEntity> list(
            @RequestParam(required = false) String thesisId,
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String defenseSessionId
    ) {
        if (thesisId != null) return reportRepo.findByThesisId(thesisId);
        if (studentId != null) return reportRepo.findByStudentId(studentId);
        if (defenseSessionId != null) return reportRepo.findByDefenseSessionId(defenseSessionId);
        return reportRepo.findAll();
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<ThesisReportEntity>> getById(@PathVariable String id) {
        return reportRepo.findById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/files")
    public Flux<ReportFileEntity> getFiles(@PathVariable String id) {
        return fileRepo.findByReportId(id);
    }

    /**
     * POST /api/thesis-reports — student submits a new report (JSON)
     */
    @PostMapping(consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<ThesisReportEntity>> submitJson(@RequestBody SubmitReportRequest req) {
        return resolveThesisId(req.thesisId(), req.studentId())
                .flatMap(tid -> saveReport(tid, req.studentId(), req.defenseSessionId(), req.reportType(), req.submissionNumber()));
    }

    /**
     * POST /api/thesis-reports — student submits a new report (multipart with optional file)
     */
    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<ThesisReportEntity>> submitMultipart(
            @RequestPart(value = "studentId", required = false) String studentId,
            @RequestPart(value = "thesisId", required = false) String thesisId,
            @RequestPart(value = "defenseSessionId", required = false) String defenseSessionId,
            @RequestPart(value = "reportType", required = false) String reportType,
            @RequestPart(value = "file", required = false) FilePart filePart
    ) {
        return resolveThesisId(thesisId, studentId)
                .flatMap(resolvedThesisId -> saveReport(resolvedThesisId, studentId, defenseSessionId, reportType, 1)
                .flatMap(resp -> {
                    if (filePart == null || resp.getBody() == null) return Mono.just(resp);
                    String reportId = resp.getBody().getId();
                    String filename = UUID.randomUUID() + "_" + filePart.filename();
                    Path dir = Paths.get(uploadDir, resolvedThesisId, reportId);
                    Path storedPath = dir.resolve(filename);
                    return Mono.fromCallable(() -> { dir.toFile().mkdirs(); return storedPath; })
                            .flatMap(path -> filePart.transferTo(path.toFile()).thenReturn(path))
                            .flatMap(path -> {
                                ReportFileEntity file = new ReportFileEntity();
                                file.setId(UUID.randomUUID().toString());
                                file.setNew(true);
                                file.setReportId(reportId);
                                file.setOriginalFilename(filePart.filename());
                                file.setStoredPath(path.toString());
                                file.setMimeType(filePart.headers().getContentType() != null
                                        ? filePart.headers().getContentType().toString() : null);
                                file.setUploadedAt(LocalDateTime.now());
                                return fileRepo.save(file);
                            })
                            .thenReturn(resp);
                }));
    }

    private Mono<ResponseEntity<ThesisReportEntity>> saveReport(
            String thesisId, String studentId, String defenseSessionId, String reportType, Integer submissionNumber) {
        ThesisReportEntity entity = new ThesisReportEntity();
        entity.setId(UUID.randomUUID().toString());
        entity.setNew(true);
        entity.setThesisId(thesisId);
        entity.setStudentId(studentId);
        entity.setDefenseSessionId(defenseSessionId);
        entity.setReportType(reportType);
        entity.setSubmissionNumber(submissionNumber != null ? submissionNumber : 1);
        entity.setStatus("SUBMITTED");
        entity.setSubmittedAt(LocalDateTime.now());
        return reportRepo.save(entity)
                .doOnNext(this::publishReportSubmitted)
                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
    }

    /**
     * Fire-and-forget publish to {@code report-submitted}. notification_service
     * listens for this and emits a {@code REPORT_SUBMITTED} notification. We
     * deliberately don't fail the HTTP response if Kafka is unhappy — the
     * report is already persisted and the user-facing flow shouldn't break
     * because of an event-bus hiccup.
     */
    private void publishReportSubmitted(ThesisReportEntity saved) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("reportId", saved.getId());
        payload.put("studentId", saved.getStudentId());
        payload.put("reportType", saved.getReportType());
        payload.put("submittedAt", saved.getSubmittedAt() != null
                ? saved.getSubmittedAt().toString()
                : LocalDateTime.now().toString());
        try {
            kafkaTemplate.send(REPORT_SUBMITTED_TOPIC, saved.getThesisId(), payload);
            log.info("📤 published report-submitted: reportId={} student={}", saved.getId(), saved.getStudentId());
        } catch (Exception ex) {
            log.warn("Failed to publish report-submitted (notification will be skipped)", ex);
        }
    }

    /**
     * POST /api/thesis-reports/{id}/upload — student uploads file for a report
     */
    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<ReportFileEntity>> uploadFile(
            @PathVariable String id,
            @RequestPart("file") FilePart filePart
    ) {
        return reportRepo.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Report not found: " + id)))
                .flatMap(report -> {
                    String filename = UUID.randomUUID() + "_" + filePart.filename();
                    Path dir = Paths.get(uploadDir, report.getThesisId(), id);
                    Path storedPath = dir.resolve(filename);

                    return Mono.fromCallable(() -> { dir.toFile().mkdirs(); return storedPath; })
                            .flatMap(path -> filePart.transferTo(path.toFile()).thenReturn(path))
                            .flatMap(path -> {
                                ReportFileEntity file = new ReportFileEntity();
                                file.setId(UUID.randomUUID().toString());
                                file.setNew(true);
                                file.setReportId(id);
                                file.setOriginalFilename(filePart.filename());
                                file.setStoredPath(path.toString());
                                file.setMimeType(filePart.headers().getContentType() != null
                                        ? filePart.headers().getContentType().toString() : null);
                                file.setUploadedAt(LocalDateTime.now());
                                return fileRepo.save(file);
                            })
                            .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
                });
    }

    /**
     * GET /api/thesis-reports/files/{fileId}/download — forces browser download
     */
    @GetMapping("/files/{fileId}/download")
    public Mono<ResponseEntity<FileSystemResource>> download(@PathVariable String fileId) {
        return fileRepo.findById(fileId)
                .map(f -> {
                    File file = new File(f.getStoredPath());
                    if (!file.exists()) return ResponseEntity.notFound().<FileSystemResource>build();
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION,
                                    "attachment; filename=\"" + f.getOriginalFilename() + "\"")
                            .contentType(MediaType.APPLICATION_OCTET_STREAM)
                            .body(new FileSystemResource(file));
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/thesis-reports/files/{fileId}/view — renders file inline in browser
     */
    @GetMapping("/files/{fileId}/view")
    public Mono<ResponseEntity<FileSystemResource>> view(@PathVariable String fileId) {
        return fileRepo.findById(fileId)
                .map(f -> {
                    File file = new File(f.getStoredPath());
                    if (!file.exists()) return ResponseEntity.notFound().<FileSystemResource>build();
                    MediaType mediaType = resolveMediaType(f.getMimeType(), f.getOriginalFilename());
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION,
                                    "inline; filename=\"" + f.getOriginalFilename() + "\"")
                            .contentType(mediaType)
                            .body(new FileSystemResource(file));
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    private MediaType resolveMediaType(String mimeType, String filename) {
        if (mimeType != null && !mimeType.isBlank()) {
            try { return MediaType.parseMediaType(mimeType); } catch (Exception ignored) {}
        }
        if (filename != null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".pdf"))  return MediaType.APPLICATION_PDF;
            if (lower.endsWith(".png"))  return MediaType.IMAGE_PNG;
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
            if (lower.endsWith(".gif"))  return MediaType.IMAGE_GIF;
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    /**
     * PATCH /api/thesis-reports/{id}/review — supervisor/committee reviews the report
     */
    @PatchMapping("/{id}/review")
    public Mono<ResponseEntity<ThesisReportEntity>> review(@PathVariable String id,
                                                            @RequestBody ReviewReportRequest req) {
        return reportRepo.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Report not found")))
                .flatMap(report -> {
                    report.setStatus(req.decision());
                    report.setReviewedBy(req.reviewedBy());
                    report.setReviewedAt(LocalDateTime.now());
                    report.setSupervisorNotes(req.notes());
                    report.setUpdatedAt(LocalDateTime.now());
                    report.setNew(false);
                    return reportRepo.save(report);
                })
                .map(ResponseEntity::ok);
    }

    public record SubmitReportRequest(String thesisId, String studentId, String defenseSessionId,
                                       String reportType, Integer submissionNumber) {}
    public record ReviewReportRequest(String reviewedBy, String decision, String notes) {}
}
