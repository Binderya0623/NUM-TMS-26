package mn.num.edu.grading_service.adapter.in.web;

import mn.num.edu.grading_service.application.port.out.GradeRepositoryPort;
import mn.num.edu.grading_service.application.port.out.ResolutionRepositoryPort;
import mn.num.edu.grading_service.domain.model.Grade;
import mn.num.edu.grading_service.domain.model.Resolution;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/grades")
public class GradingController {

    private final GradeRepositoryPort gradeRepository;
    private final ResolutionRepositoryPort resolutionRepository;

    public GradingController(GradeRepositoryPort gradeRepository,
                             ResolutionRepositoryPort resolutionRepository) {
        this.gradeRepository = gradeRepository;
        this.resolutionRepository = resolutionRepository;
    }

    @GetMapping("/thesis/{thesisId}")
    public Mono<ResponseEntity<Grade>> getByThesis(@PathVariable String thesisId) {
        return gradeRepository.findByThesisId(thesisId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/workflow/{workflowId}")
    public Flux<Grade> getByWorkflow(@PathVariable String workflowId) {
        return gradeRepository.findByWorkflowId(workflowId);
    }

    @GetMapping("/resolutions/workflow/{workflowId}")
    public Mono<ResponseEntity<Resolution>> getResolution(@PathVariable String workflowId) {
        return resolutionRepository.findByWorkflowId(workflowId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
