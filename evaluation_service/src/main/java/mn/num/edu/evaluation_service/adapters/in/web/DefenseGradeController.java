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
        if (defenseSessionId != null && studentId != null && evaluatorId != null) {
            // Check if secretary submitted — if not, return only caller's own grade
            return submissionRepo.findByDefenseSessionIdAndStudentId(defenseSessionId, studentId)
                    .flatMapMany(sub -> gradeRepo.findByDefenseSessionIdAndStudentId(defenseSessionId, studentId))
                    .switchIfEmpty(gradeRepo.findByDefenseSessionIdAndThesisIdAndEvaluatorId(
                            defenseSessionId, "", evaluatorId).flux());
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
        return gradeRepo.findByDefenseSessionIdAndThesisIdAndEvaluatorId(
                req.defenseSessionId(), req.thesisId(), req.evaluatorId())
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
