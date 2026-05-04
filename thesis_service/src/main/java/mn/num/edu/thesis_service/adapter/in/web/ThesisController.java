package mn.num.edu.thesis_service.adapter.in.web;


import mn.num.edu.thesis_service.application.dto.*;
import mn.num.edu.thesis_service.application.port.in.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/theses")
public class ThesisController {

    private final CreateThesisUseCase createThesisUseCase;
    private final UpdateThesisUseCase updateThesisUseCase;
    private final ApproveThesisUseCase approveThesisUseCase;
    private final RejectThesisUseCase rejectThesisUseCase;
    private final ChangeThesisStatusUseCase changeThesisStatusUseCase;
    private final GetThesisUseCase getThesisUseCase;

    public ThesisController(
            CreateThesisUseCase createThesisUseCase,
            UpdateThesisUseCase updateThesisUseCase,
            ApproveThesisUseCase approveThesisUseCase,
            RejectThesisUseCase rejectThesisUseCase,
            ChangeThesisStatusUseCase changeThesisStatusUseCase,
            GetThesisUseCase getThesisUseCase
    ) {
        this.createThesisUseCase = createThesisUseCase;
        this.updateThesisUseCase = updateThesisUseCase;
        this.approveThesisUseCase = approveThesisUseCase;
        this.rejectThesisUseCase = rejectThesisUseCase;
        this.changeThesisStatusUseCase = changeThesisStatusUseCase;
        this.getThesisUseCase = getThesisUseCase;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ThesisResponse> create(@Valid @RequestBody CreateThesisCommand command) {
        return createThesisUseCase.create(command);
    }

    @PutMapping("/{id}")
    public Mono<ThesisResponse> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateThesisCommand command
    ) {
        return updateThesisUseCase.update(id, command);
    }

    @PostMapping("/{id}/approve")
    public Mono<ThesisResponse> approve(@PathVariable String id) {
        return approveThesisUseCase.approve(id);
    }

    @PostMapping("/{id}/reject")
    public Mono<ThesisResponse> reject(@PathVariable String id) {
        return rejectThesisUseCase.reject(id);
    }

    @PatchMapping("/{id}/status")
    public Mono<ThesisResponse> changeStatus(
            @PathVariable String id,
            @Valid @RequestBody ChangeThesisStatusCommand command
    ) {
        return changeThesisStatusUseCase.changeStatus(id, command);
    }

    @GetMapping("/{id}")
    public Mono<ThesisResponse> getById(@PathVariable String id) {
        return getThesisUseCase.getById(id);
    }

    @GetMapping
    public Object getAll(@RequestParam(required = false) String studentId) {
        if (studentId != null) {
            return getThesisUseCase.getByStudentId(studentId);
        }
        return getThesisUseCase.getAll();
    }
}
