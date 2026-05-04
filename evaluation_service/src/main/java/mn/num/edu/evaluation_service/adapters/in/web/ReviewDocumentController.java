package mn.num.edu.evaluation_service.adapters.in.web;

import mn.num.edu.evaluation_service.adapters.out.persistence.entity.ReviewDocumentEntity;
import mn.num.edu.evaluation_service.adapters.out.persistence.repository.ReviewDocumentR2dbcRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/review-documents")
public class ReviewDocumentController {

    private final ReviewDocumentR2dbcRepository repository;

    @Value("${app.upload.dir:${java.io.tmpdir}/thesis-uploads/reviews}")
    private String uploadDir;

    public ReviewDocumentController(ReviewDocumentR2dbcRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Flux<ReviewDocumentEntity> list(
            @RequestParam(required = false) String defenseSessionId,
            @RequestParam(required = false) String reviewerId,
            @RequestParam(required = false) String studentId
    ) {
        if (studentId != null) return repository.findByStudentId(studentId);
        if (defenseSessionId != null) return repository.findByDefenseSessionId(defenseSessionId);
        if (reviewerId != null) return repository.findByReviewerId(reviewerId);
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<ReviewDocumentEntity>> getById(@PathVariable UUID id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/review-documents/upload
     * Reviewer uploads their written review document.
     * Uses multipart upload (reactive FilePart).
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<ReviewDocumentEntity>> upload(
            @RequestPart("file") FilePart filePart,
            @RequestParam String defenseSessionId,
            @RequestParam String thesisId,
            @RequestParam String studentId,
            @RequestParam String reviewerId
    ) {
        // Check for duplicate upload — one per (session, student, reviewer)
        return repository.findByDefenseSessionIdAndStudentIdAndReviewerId(defenseSessionId, studentId, reviewerId)
                .flatMap(existing -> Mono.<ResponseEntity<ReviewDocumentEntity>>error(
                        new IllegalStateException("Review document already uploaded")))
                .switchIfEmpty(Mono.defer(() -> {
                    String filename = UUID.randomUUID() + "_" + filePart.filename();
                    Path dir = Paths.get(uploadDir, defenseSessionId, studentId);
                    Path storedPath = dir.resolve(filename);

                    return Mono.fromCallable(() -> {
                        dir.toFile().mkdirs();
                        return storedPath;
                    })
                    .flatMap(path -> filePart.transferTo(path.toFile()).thenReturn(path))
                    .flatMap(path -> {
                        ReviewDocumentEntity entity = ReviewDocumentEntity.create(
                                defenseSessionId, thesisId, studentId, reviewerId,
                                filePart.filename(), path.toString(), null,
                                filePart.headers().getContentType() != null
                                        ? filePart.headers().getContentType().toString() : null
                        );
                        return repository.save(entity);
                    })
                    .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
                }));
    }

    /**
     * GET /api/review-documents/{id}/download — download the review document
     */
    @GetMapping("/{id}/download")
    public Mono<ResponseEntity<FileSystemResource>> download(@PathVariable UUID id) {
        return repository.findById(id)
                .map(doc -> {
                    File file = new File(doc.getStoredPath());
                    if (!file.exists()) return ResponseEntity.notFound().<FileSystemResource>build();
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION,
                                    "attachment; filename=\"" + doc.getOriginalFilename() + "\"")
                            .contentType(MediaType.APPLICATION_OCTET_STREAM)
                            .body(new FileSystemResource(file));
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
