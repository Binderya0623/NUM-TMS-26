package mn.num.edu.committee_service.adapter.in.web.controller;

import mn.num.edu.committee_service.adapter.in.web.request.AssignStudentRequest;
import mn.num.edu.committee_service.adapter.in.web.request.AssignTeacherRequest;
import mn.num.edu.committee_service.adapter.in.web.request.CreateCommitteeRequest;
import mn.num.edu.committee_service.adapter.in.web.response.ApiResponse;
import mn.num.edu.committee_service.adapter.out.persistence.CommitteeR2dbcRepository;
import mn.num.edu.committee_service.adapter.out.persistence.StudentR2dbcRepository;
import mn.num.edu.committee_service.application.dto.AssignStudentCommand;
import mn.num.edu.committee_service.application.dto.AssignTeacherCommand;
import mn.num.edu.committee_service.application.dto.CreateCommitteeCommand;
import mn.num.edu.committee_service.application.port.in.AssignStudentUseCase;
import mn.num.edu.committee_service.application.port.in.AssignTeacherUseCase;
import mn.num.edu.committee_service.application.port.in.CreateCommitteeUseCase;
import mn.num.edu.committee_service.domain.model.Committee;
import mn.num.edu.committee_service.domain.model.CommitteeStudent;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/committees")
public class CommitteeController {

    private static final Logger log = LoggerFactory.getLogger(CommitteeController.class);

    private final CreateCommitteeUseCase createCommitteeUseCase;
    private final AssignTeacherUseCase assignTeacherUseCase;
    private final AssignStudentUseCase assignStudentUseCase;
    private final CommitteeR2dbcRepository committeeRepo;
    private final StudentR2dbcRepository studentRepo;

    public CommitteeController(
            CreateCommitteeUseCase createCommitteeUseCase,
            AssignTeacherUseCase assignTeacherUseCase,
            AssignStudentUseCase assignStudentUseCase,
            CommitteeR2dbcRepository committeeRepo,
            StudentR2dbcRepository studentRepo
    ) {
        this.createCommitteeUseCase = createCommitteeUseCase;
        this.assignTeacherUseCase = assignTeacherUseCase;
        this.assignStudentUseCase = assignStudentUseCase;
        this.committeeRepo = committeeRepo;
        this.studentRepo = studentRepo;
    }

    @PostMapping
    public Mono<Committee> createCommittee(@Valid @RequestBody CreateCommitteeRequest request) {

        log.info("Creating committee. departmentId={}, name={}, defenseType={}",
                request.departmentId(), request.name(), request.defenseType());

        return createCommitteeUseCase.execute(
                        new CreateCommitteeCommand(
                                request.departmentId(),
                                request.name(),
                                request.defenseType()
                        )
                )
                .doOnNext(c -> log.info("Committee created successfully. id={}", c.getId()))
                .doOnError(e -> log.error("Failed to create committee", e));
    }

    @GetMapping
    public Flux<Committee> getCommittees() {

        log.info("Fetching all committees");

        return createCommitteeUseCase.findAll()
                .doOnNext(c -> log.debug("Committee fetched. id={}", c.getId()))
                .doOnError(e -> log.error("Failed to fetch committees", e));
    }

    @GetMapping("/all")
    public Flux<Committee> getCommitteesFull() {
        return getCommittees();
    }

    public record CloseCommitteeRequest(String closingNote) {}

    @PatchMapping("/{id}/close")
    public Mono<ResponseEntity<Committee>> closeCommittee(
            @PathVariable String id,
            @RequestBody(required = false) CloseCommitteeRequest body
    ) {
        String note = body == null ? null : body.closingNote();
        log.info("Closing committee id={} hasNote={}", id, note != null && !note.isBlank());
        return committeeRepo.findById(id)
                .map(c -> {
                    Committee withNote = (note != null && !note.isBlank()) ? c.withClosingNote(note) : c;
                    return withNote.withStatus("CLOSED");
                })
                .flatMap(committeeRepo::save)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<Committee>> getCommitteeById(@PathVariable String id) {

        log.info("Fetching committee by id={}", id);

        return createCommitteeUseCase.findById(id)
                .map(c -> {
                    log.info("Committee found. id={}", id);
                    return ResponseEntity.ok(c);
                })
                .doOnError(e -> log.error("Error fetching committee id={}", id, e))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping("/{committeeId}/teachers")
    public Mono<ResponseEntity<ApiResponse>> assignTeacher(
            @PathVariable String committeeId,
            @Valid @RequestBody AssignTeacherRequest request
    ) {

        log.info("Assigning teacher. committeeId={}, teacherId={}, role={}",      committeeId, request.teacherId(), request.role());

        return assignTeacherUseCase.execute(
                        new AssignTeacherCommand(
                                committeeId,
                                request.teacherId(),
                                request.role(),
                                request.departmentId()
                        )
                )
                .doOnSuccess(v -> log.info("Teacher assigned successfully. committeeId={}, teacherId={}",
                        committeeId, request.teacherId()))
                .doOnError(e -> log.error("Failed to assign teacher. committeeId={}, teacherId={}",
                        committeeId, request.teacherId(), e))
                .thenReturn(ResponseEntity.ok(new ApiResponse("Teacher assigned successfully")));
    }

    @GetMapping("/{committeeId}/students")
    public Flux<CommitteeStudent> getStudents(@PathVariable String committeeId) {
        return studentRepo.findByCommitteeId(committeeId);
    }

    @GetMapping("/by-student/{studentId}")
    public Flux<CommitteeStudent> getCommitteeByStudent(@PathVariable String studentId) {
        return studentRepo.findByStudentId(studentId);
    }

    @PostMapping("/{committeeId}/students")
    public Mono<ResponseEntity<ApiResponse>> assignStudent(
            @PathVariable String committeeId,
            @Valid @RequestBody AssignStudentRequest request
    ) {

        log.info("Assigning student. committeeId={}, studentId={}", committeeId, request.studentId());

        return assignStudentUseCase.execute(
                        new AssignStudentCommand(
                                committeeId,
                                request.studentId(),
                                request.departmentId()

                        )
                )
                .doOnSuccess(v -> log.info("Student assigned successfully. committeeId={}, studentId={}",
                        committeeId, request.studentId()))
                .doOnError(e -> log.error("Failed to assign student. committeeId={}, studentId={}",
                        committeeId, request.studentId(), e))
                .thenReturn(ResponseEntity.ok(new ApiResponse("Student assigned successfully")))
                .onErrorResume(org.springframework.dao.DuplicateKeyException.class, e ->
                        Mono.just(ResponseEntity.ok(new ApiResponse("Student already assigned"))));
    }

    /**
     * DELETE /api/committees/{committeeId}/students/{studentId}
     *
     * Detach a student from a committee. We delete by composite key rather
     * than by row id so the FE doesn't need to know the assignment id.
     */
    @DeleteMapping("/{committeeId}/students/{studentId}")
    public Mono<ResponseEntity<ApiResponse>> unassignStudent(
            @PathVariable String committeeId,
            @PathVariable String studentId
    ) {
        log.info("Unassigning student. committeeId={}, studentId={}", committeeId, studentId);
        return studentRepo.findByCommitteeId(committeeId)
                .filter(cs -> studentId.equals(cs.getStudentId()))
                .next()
                .flatMap(cs -> studentRepo.deleteById(cs.getId()).thenReturn(cs))
                .map(cs -> ResponseEntity.ok(new ApiResponse("Student unassigned")))
                .defaultIfEmpty(ResponseEntity.ok(new ApiResponse("Student not on this committee")));
    }
}