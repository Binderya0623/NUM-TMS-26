package mn.num.edu.report_service.adapter.in.web;

import mn.num.edu.report_service.application.port.in.GenerateAcademicReportUseCase;
import mn.num.edu.report_service.application.port.out.AcademicReportRepositoryPort;
import mn.num.edu.report_service.domain.model.AcademicReport;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/academic-reports")
public class ReportController {

    private final AcademicReportRepositoryPort reportRepository;
    private final GenerateAcademicReportUseCase generateUseCase;

    public ReportController(AcademicReportRepositoryPort reportRepository,
                            GenerateAcademicReportUseCase generateUseCase) {
        this.reportRepository = reportRepository;
        this.generateUseCase = generateUseCase;
    }

    @GetMapping
    public Flux<AcademicReport> getAll(@RequestParam(required = false) String departmentId,
                                       @RequestParam(required = false) String academicYear) {
        if (departmentId != null) return reportRepository.findByDepartmentId(departmentId);
        if (academicYear != null) return reportRepository.findByAcademicYear(academicYear);
        return reportRepository.findAll();
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<AcademicReport>> getById(@PathVariable UUID id) {
        return reportRepository.findById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping("/generate")
    public Mono<ResponseEntity<AcademicReport>> generate(
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String academicYear) {
        return generateUseCase.generate(departmentId, academicYear)
                .map(r -> ResponseEntity.ok(r));
    }
}
