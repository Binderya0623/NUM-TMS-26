package mn.num.edu.committee_service.adapter.in.web.controller;

import mn.num.edu.committee_service.adapter.out.persistence.ReviewerAssignmentR2dbcRepository;
import mn.num.edu.committee_service.domain.model.ReviewerAssignment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/reviewer-assignments")
public class ReviewerAssignmentController {

    private static final Logger log = LoggerFactory.getLogger(ReviewerAssignmentController.class);

    private final ReviewerAssignmentR2dbcRepository repository;

    public ReviewerAssignmentController(ReviewerAssignmentR2dbcRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Flux<ReviewerAssignment> listAll(
            @RequestParam(required = false) String committeeId,
            @RequestParam(required = false) String defenseSessionId,
            @RequestParam(required = false) String reviewerId
    ) {
        if (defenseSessionId != null) return repository.findByDefenseSessionId(defenseSessionId);
        if (committeeId != null) return repository.findByCommitteeId(committeeId);
        if (reviewerId != null) return repository.findByReviewerId(reviewerId);
        return repository.findAll();
    }

    @GetMapping("/by-session-student")
    public Mono<ResponseEntity<ReviewerAssignment>> getBySessionStudent(
            @RequestParam String defenseSessionId, @RequestParam String studentId) {
        return repository.findByDefenseSessionIdAndStudentId(defenseSessionId, studentId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/reviewer-assignments
     * HEAD assigns a reviewer (must be a committee member) to a student for a defense session.
     */
    @PostMapping
    public Mono<ResponseEntity<ReviewerAssignment>> assign(@RequestBody AssignReviewerRequest req) {
        log.info("Assigning reviewer. committeeId={}, sessionId={}, studentId={}, reviewerId={}",
                req.committeeId(), req.defenseSessionId(), req.studentId(), req.reviewerId());

        // Verify no duplicate assignment for (session, student)
        return repository.findByDefenseSessionIdAndStudentId(req.defenseSessionId(), req.studentId())
                .flatMap(existing -> Mono.<ResponseEntity<ReviewerAssignment>>error(
                        new IllegalStateException("Reviewer already assigned for this student in this session")))
                .switchIfEmpty(
                        Mono.just(ReviewerAssignment.create(
                                req.committeeId(), req.defenseSessionId(),
                                req.studentId(), req.reviewerId(), req.assignedBy()))
                        .flatMap(repository::save)
                        .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved))
                );
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Object>> delete(@PathVariable String id) {
        return repository.findById(id)
                .flatMap(ra -> repository.delete(ra).thenReturn(ResponseEntity.noContent().build()))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    public record AssignReviewerRequest(String committeeId, String defenseSessionId,
                                         String studentId, String reviewerId, String assignedBy) {}
}
