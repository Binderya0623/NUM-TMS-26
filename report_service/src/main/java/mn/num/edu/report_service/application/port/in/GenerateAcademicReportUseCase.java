package mn.num.edu.report_service.application.port.in;

import mn.num.edu.report_service.domain.model.AcademicReport;
import reactor.core.publisher.Mono;

public interface GenerateAcademicReportUseCase {
    Mono<AcademicReport> generate(String departmentId, String academicYear);
}
