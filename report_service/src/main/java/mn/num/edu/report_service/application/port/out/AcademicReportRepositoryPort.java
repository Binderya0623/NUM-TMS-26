package mn.num.edu.report_service.application.port.out;

import mn.num.edu.report_service.domain.model.AcademicReport;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface AcademicReportRepositoryPort {
    Mono<AcademicReport> save(AcademicReport report);
    Mono<AcademicReport> findById(UUID id);
    Flux<AcademicReport> findAll();
    Flux<AcademicReport> findByDepartmentId(String departmentId);
    Flux<AcademicReport> findByAcademicYear(String academicYear);
}
