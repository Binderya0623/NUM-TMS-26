package mn.num.edu.evaluation_service.adapters.in.web;

import mn.num.edu.evaluation_service.adapters.out.persistence.entity.DefenseGradeEntity;
import mn.num.edu.evaluation_service.adapters.out.persistence.repository.DefenseGradeR2dbcRepository;
import mn.num.edu.evaluation_service.adapters.out.persistence.repository.SecretarySubmissionR2dbcRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/defense-grades")
public class DefenseGradeController {

    private final DefenseGradeR2dbcRepository gradeRepo;
    private final SecretarySubmissionR2dbcRepository submissionRepo;

    public DefenseGradeController(DefenseGradeR2dbcRepository gradeRepo,
                                   SecretarySubmissionR2dbcRepository submissionRepo) {
        this.gradeRepo = gradeRepo;
        this.submissionRepo = submissionRepo;
    }

    /**
     * GET /api/defense-grades?defenseSessionId=xxx&studentId=yyy
     * Blind rule: if no secretary_submission exists yet for this (session, student),
     * only the caller's own grade is returned (enforced by evaluatorId param).
     */
    @GetMapping
    public Flux<DefenseGradeEntity> list(
            @RequestParam(required = false) String defenseSessionId,
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String evaluatorId
    ) {
        // Caller asked specifically for their own grades in a session — honor it.
        // Without this branch the (session, evaluator) query would fall through to
        // findByDefenseSessionId and return *every* evaluator's grades, which made
        // the external-expert page show "X/X graded" before they had graded anyone.
        if (defenseSessionId != null && evaluatorId != null && studentId == null) {
            return gradeRepo.findByDefenseSessionIdAndEvaluatorId(defenseSessionId, evaluatorId);
        }
        if (defenseSessionId != null && studentId != null && evaluatorId != null) {
            // Blind rule: until the secretary submits the average, only the caller's
            // own grade is returned. After submission, all grades for this student
            // become visible.
            return submissionRepo.findByDefenseSessionIdAndStudentId(defenseSessionId, studentId)
                    .flatMapMany(sub -> gradeRepo.findByDefenseSessionIdAndStudentId(defenseSessionId, studentId))
                    .switchIfEmpty(gradeRepo.findByDefenseSessionIdAndEvaluatorId(defenseSessionId, evaluatorId));
        }
        if (defenseSessionId != null && studentId != null) {
            return submissionRepo.findByDefenseSessionIdAndStudentId(defenseSessionId, studentId)
                    .flatMapMany(sub -> gradeRepo.findByDefenseSessionIdAndStudentId(defenseSessionId, studentId))
                    .switchIfEmpty(Flux.empty());
        }
        if (defenseSessionId != null) return gradeRepo.findByDefenseSessionId(defenseSessionId);
        if (evaluatorId != null) return gradeRepo.findByEvaluatorId(evaluatorId);
        if (studentId != null) return gradeRepo.findByStudentId(studentId);
        return gradeRepo.findAll();
    }

    /**
     * GET /api/defense-grades/my?defenseSessionId=xxx&thesisId=yyy&evaluatorId=zzz
     * Always returns the caller's own grade regardless of blind restriction.
     */
    @GetMapping("/my")
    public Mono<ResponseEntity<DefenseGradeEntity>> myGrade(
            @RequestParam String defenseSessionId,
            @RequestParam String thesisId,
            @RequestParam String evaluatorId
    ) {
        return gradeRepo.findByDefenseSessionIdAndThesisIdAndEvaluatorId(defenseSessionId, thesisId, evaluatorId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/defense-grades — evaluator saves/updates their grade (not yet submitted).
     * Idempotent: if a grade already exists for (session, thesis, evaluator), update it.
     */
    @PostMapping
    public Mono<ResponseEntity<DefenseGradeEntity>> saveGrade(@RequestBody SaveGradeRequest req) {
        // Upsert key is (session, student, evaluator). Earlier we keyed by
        // (session, thesis, evaluator) — when an evaluator graded several students
        // whose thesis_id was blank/identical, those rows collided on the
        // (session, thesis, evaluator, role) unique constraint and the second
        // save silently overwrote the first.
        return gradeRepo.findByDefenseSessionIdAndStudentIdAndEvaluatorId(
                req.defenseSessionId(), req.studentId(), req.evaluatorId())
                .flatMap(existing -> {
                    existing.setPoints(req.points());
                    existing.setComment(req.comment());
                    existing.setIsSubmitted(true);
                    existing.setSubmittedAt(LocalDateTime.now());
                    existing.setNew(false);
                    return gradeRepo.save(existing);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    DefenseGradeEntity e = DefenseGradeEntity.create(
                            req.defenseSessionId(), req.thesisId(), req.studentId(),
                            req.evaluatorId(), req.evaluatorRole(), req.points(), req.maxPoints(), req.comment()
                    );
                    // Mark as submitted on save: the caller always pairs save with a
                    // /submit follow-up, but if that second call drops the grade was
                    // stranded as draft and invisible to the secretary.
                    e.setIsSubmitted(true);
                    e.setSubmittedAt(LocalDateTime.now());
                    return gradeRepo.save(e);
                }))
                .map(ResponseEntity::ok);
    }

    /**
     * POST /api/defense-grades/{id}/submit — evaluator finalizes (locks) their grade.
     */
    @PostMapping("/{id}/submit")
    public Mono<ResponseEntity<DefenseGradeEntity>> submitGrade(@PathVariable UUID id) {
        return gradeRepo.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Grade not found")))
                .flatMap(e -> {
                    e.setIsSubmitted(true);
                    e.setSubmittedAt(LocalDateTime.now());
                    e.setNew(false);
                    return gradeRepo.save(e);
                })
                .map(ResponseEntity::ok);
    }

    public record SaveGradeRequest(
            String defenseSessionId, String thesisId, String studentId,
            String evaluatorId, String evaluatorRole,
            BigDecimal points, BigDecimal maxPoints, String comment
    ) {}
}
