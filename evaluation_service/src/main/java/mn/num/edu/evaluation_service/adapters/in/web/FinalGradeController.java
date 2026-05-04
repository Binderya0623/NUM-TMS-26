package mn.num.edu.evaluation_service.adapters.in.web;

import mn.num.edu.evaluation_service.adapters.out.persistence.entity.FinalGradeConfirmationEntity;
import mn.num.edu.evaluation_service.adapters.out.persistence.repository.FinalGradeConfirmationR2dbcRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/final-grades")
public class FinalGradeController {

    private final FinalGradeConfirmationR2dbcRepository repository;

    public FinalGradeController(FinalGradeConfirmationR2dbcRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Flux<FinalGradeConfirmationEntity> list(
            @RequestParam(required = false) String committeeId,
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) Boolean isPublished
    ) {
        if (studentId != null) return repository.findByStudentId(studentId).flux();
        if (committeeId != null) return repository.findByCommitteeId(committeeId);
        if (isPublished != null) return repository.findByIsPublished(isPublished);
        return repository.findAll();
    }

    @GetMapping("/by-student/{studentId}")
    public Mono<ResponseEntity<FinalGradeConfirmationEntity>> byStudent(@PathVariable String studentId) {
        return repository.findByStudentId(studentId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.ok().build());
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<FinalGradeConfirmationEntity>> getById(@PathVariable UUID id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/final-grades — HEAD confirms final grade for a student.
     * Creates or updates the record. Sets is_published = false until explicitly published.
     */
    @PostMapping
    public Mono<ResponseEntity<FinalGradeConfirmationEntity>> confirmGrade(@RequestBody ConfirmGradeRequest req) {
        return repository.findByStudentId(req.studentId())
                .flatMap(existing -> {
                    populateEntity(existing, req);
                    existing.setNew(false);
                    return repository.save(existing);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    FinalGradeConfirmationEntity entity = new FinalGradeConfirmationEntity();
                    entity.setId(UUID.randomUUID());
                    entity.setNew(true);
                    entity.setConfirmedAt(LocalDateTime.now());
                    entity.setIsPublished(false);
                    populateEntity(entity, req);
                    return repository.save(entity);
                }))
                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
    }

    /**
     * PATCH /api/final-grades/{id}/publish — HEAD publishes the grade (visible to student).
     */
    @PatchMapping("/{id}/publish")
    public Mono<ResponseEntity<FinalGradeConfirmationEntity>> publish(@PathVariable UUID id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Grade confirmation not found")))
                .flatMap(e -> {
                    e.setIsPublished(true);
                    e.setPublishedAt(LocalDateTime.now());
                    e.setNew(false);
                    return repository.save(e);
                })
                .map(ResponseEntity::ok);
    }

    private void populateEntity(FinalGradeConfirmationEntity e, ConfirmGradeRequest req) {
        e.setStudentId(req.studentId());
        e.setThesisId(req.thesisId());
        e.setCommitteeId(req.committeeId());
        e.setConfirmedBy(req.confirmedBy());
        e.setProgress1Score(req.progress1Score());
        e.setProgress2Score(req.progress2Score());
        e.setPreliminaryScore(req.preliminaryScore());
        e.setFinalCommitteeScore(req.finalCommitteeScore());
        e.setReviewerScore(req.reviewerScore());
        // Compute total
        BigDecimal total = BigDecimal.ZERO;
        if (req.progress1Score() != null) total = total.add(req.progress1Score());
        if (req.progress2Score() != null) total = total.add(req.progress2Score());
        if (req.preliminaryScore() != null) total = total.add(req.preliminaryScore());
        if (req.finalCommitteeScore() != null) total = total.add(req.finalCommitteeScore());
        if (req.reviewerScore() != null) total = total.add(req.reviewerScore());
        e.setTotalScore(total);
        e.setGradeLetter(req.gradeLetter());
        e.setPassFail(req.passFail());
        e.setHeadNotes(req.headNotes());
    }

    public record ConfirmGradeRequest(
            String studentId, String thesisId, String committeeId, String confirmedBy,
            BigDecimal progress1Score, BigDecimal progress2Score, BigDecimal preliminaryScore,
            BigDecimal finalCommitteeScore, BigDecimal reviewerScore,
            String gradeLetter, String passFail, String headNotes
    ) {}
}
