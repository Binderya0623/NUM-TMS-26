package mn.num.edu.evaluation_service.adapters.in.web;

import mn.num.edu.evaluation_service.adapters.out.persistence.entity.DefenseGradeEntity;
import mn.num.edu.evaluation_service.adapters.out.persistence.entity.SecretarySubmissionEntity;
import mn.num.edu.evaluation_service.adapters.out.persistence.repository.DefenseGradeR2dbcRepository;
import mn.num.edu.evaluation_service.adapters.out.persistence.repository.SecretarySubmissionR2dbcRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Set;

@RestController
@RequestMapping("/api/secretary-submissions")
public class SecretarySubmissionController {

    // Roles that count toward committee average (exclude REVIEWER)
    private static final Set<String> COMMITTEE_ROLES = Set.of("SUPERVISOR", "MEMBER", "HEAD", "SECRETARY", "EXTERNAL_EXPERT");

    private final DefenseGradeR2dbcRepository gradeRepo;
    private final SecretarySubmissionR2dbcRepository submissionRepo;

    public SecretarySubmissionController(DefenseGradeR2dbcRepository gradeRepo,
                                          SecretarySubmissionR2dbcRepository submissionRepo) {
        this.gradeRepo = gradeRepo;
        this.submissionRepo = submissionRepo;
    }

    @GetMapping
    public Flux<SecretarySubmissionEntity> list(
            @RequestParam(required = false) String defenseSessionId,
            @RequestParam(required = false) String committeeId,
            @RequestParam(required = false) String studentId
    ) {
        if (defenseSessionId != null) return submissionRepo.findByDefenseSessionId(defenseSessionId);
        if (committeeId != null) return submissionRepo.findByCommitteeId(committeeId);
        if (studentId != null) return submissionRepo.findByStudentId(studentId);
        return submissionRepo.findAll();
    }

    @GetMapping("/by-session-student")
    public Mono<ResponseEntity<SecretarySubmissionEntity>> getBySessionStudent(
            @RequestParam String defenseSessionId, @RequestParam String studentId) {
        return submissionRepo.findByDefenseSessionIdAndStudentId(defenseSessionId, studentId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/secretary-submissions
     * Secretary computes average from all submitted committee grades for a student in a session,
     * saves it, and lifts blind restriction for this (session, student).
     */
    @PostMapping
    public Mono<ResponseEntity<SecretarySubmissionEntity>> submit(@RequestBody SubmitRequest req) {
        // Check for duplicate
        return submissionRepo.findByDefenseSessionIdAndStudentId(req.defenseSessionId(), req.studentId())
                .flatMap(existing -> Mono.<ResponseEntity<SecretarySubmissionEntity>>error(
                        new IllegalStateException("Average score already submitted for this student")))
                .switchIfEmpty(
                        gradeRepo.findSubmittedBySessionAndStudent(req.defenseSessionId(), req.studentId())
                                .filter(g -> COMMITTEE_ROLES.contains(g.getEvaluatorRole()))
                                .collectList()
                                .flatMap(grades -> {
                                    if (grades.isEmpty()) {
                                        return Mono.error(new IllegalStateException("No submitted grades found"));
                                    }
                                    BigDecimal avg = grades.stream()
                                            .map(DefenseGradeEntity::getPoints)
                                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                                            .divide(BigDecimal.valueOf(grades.size()), 2, RoundingMode.HALF_UP);

                                    SecretarySubmissionEntity sub = SecretarySubmissionEntity.create(
                                            req.defenseSessionId(), req.committeeId(), req.studentId(),
                                            req.secretaryId(), avg, grades.size()
                                    );
                                    return submissionRepo.save(sub);
                                })
                                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved))
                );
    }

    public record SubmitRequest(String defenseSessionId, String committeeId,
                                 String studentId, String secretaryId) {}
}
