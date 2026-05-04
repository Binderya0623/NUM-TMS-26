package mn.num.edu.evaluation_service.adapters.in.web;

import mn.num.edu.evaluation_service.application.dto.SubmitEvaluationCommand;
import mn.num.edu.evaluation_service.application.port.in.SubmitEvaluationUseCase;
import mn.num.edu.evaluation_service.application.dto.UpdateEvaluationCommand;
import mn.num.edu.evaluation_service.application.port.in.UpdateEvaluationUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    private final SubmitEvaluationUseCase submitEvaluationUseCase;
    private final UpdateEvaluationUseCase updateEvaluationUseCase;

    public EvaluationController(
            SubmitEvaluationUseCase submitEvaluationUseCase,
            UpdateEvaluationUseCase updateEvaluationUseCase
    ) {
        this.submitEvaluationUseCase = submitEvaluationUseCase;
        this.updateEvaluationUseCase = updateEvaluationUseCase;
    }

    @PostMapping("/submit")
    public Mono<ResponseEntity<Void>> submit(@RequestBody SubmitEvaluationCommand command) {
        return submitEvaluationUseCase.submit(command)
                .thenReturn(ResponseEntity.ok().build());
    }

    @PutMapping("/update")
    public Mono<ResponseEntity<Void>> update(@RequestBody UpdateEvaluationCommand command) {
        return updateEvaluationUseCase.update(command)
                .thenReturn(ResponseEntity.ok().build());
    }
}