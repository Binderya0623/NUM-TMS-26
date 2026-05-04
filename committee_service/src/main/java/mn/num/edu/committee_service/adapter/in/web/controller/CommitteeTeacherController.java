package mn.num.edu.committee_service.adapter.in.web.controller;

import mn.num.edu.committee_service.domain.model.CommitteeRole;
import mn.num.edu.committee_service.domain.model.CommitteeTeacher;
import mn.num.edu.committee_service.adapter.out.persistence.TeacherR2dbcRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/committee-teachers")
public class CommitteeTeacherController {

    private static final Logger log = LoggerFactory.getLogger(CommitteeTeacherController.class);

    private final TeacherR2dbcRepository repository;

    public CommitteeTeacherController(TeacherR2dbcRepository repository) {
        this.repository = repository;
    }

    /** GET /api/committee-teachers?committeeId=xxx or ?teacherId=xxx */
    @GetMapping
    public Flux<CommitteeTeacher> list(
            @RequestParam(required = false) String committeeId,
            @RequestParam(required = false) String teacherId
    ) {
        if (committeeId != null) {
            return repository.findAll().filter(ct -> committeeId.equals(ct.getCommitteeId()));
        }
        if (teacherId != null) {
            return repository.findAll().filter(ct -> teacherId.equals(ct.getTeacherId()));
        }
        return repository.findAll();
    }

    /** POST /api/committee-teachers — assign teacher to committee */
    @PostMapping
    public Mono<ResponseEntity<CommitteeTeacher>> assign(@RequestBody AssignRequest req) {
        log.info("Assigning teacher to committee. committeeId={}, teacherId={}, role={}",
                req.committeeId(), req.teacherId(), req.role());

        CommitteeRole role;
        try {
            role = CommitteeRole.valueOf(req.role() != null ? req.role().toUpperCase() : "MEMBER");
        } catch (IllegalArgumentException e) {
            role = CommitteeRole.MEMBER;
        }

        CommitteeTeacher ct = CommitteeTeacher.create(req.committeeId(), req.teacherId(), role);
        return repository.save(ct)
                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
    }

    /** DELETE /api/committee-teachers/{id} */
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Object>> delete(@PathVariable String id) {
        return repository.findById(id)
                .flatMap(ct -> repository.delete(ct).thenReturn(ResponseEntity.noContent().build()))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    public record AssignRequest(String committeeId, String teacherId, String role) {}
}
