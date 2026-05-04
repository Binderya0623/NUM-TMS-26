package mn.num.edu.report_service.application.service;

import mn.num.edu.report_service.application.port.in.GenerateAcademicReportUseCase;
import mn.num.edu.report_service.application.port.out.AcademicReportRepositoryPort;
import mn.num.edu.report_service.domain.model.AcademicReport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

public class ReportApplicationService implements GenerateAcademicReportUseCase {

    private static final Logger log = LoggerFactory.getLogger(ReportApplicationService.class);

    private final AcademicReportRepositoryPort reportRepository;

    public ReportApplicationService(AcademicReportRepositoryPort reportRepository) {
        this.reportRepository = reportRepository;
    }

    @Override
    public Mono<AcademicReport> generate(String departmentId, String academicYear) {
        String year = (academicYear != null && !academicYear.isBlank())
                ? academicYear
                : deriveAcademicYear();

        AcademicReport report = AcademicReport.create(departmentId, year, 0, 0, 0, null);
        log.info("Generating academic report for dept={} year={}", departmentId, year);
        return reportRepository.save(report);
    }

    public Mono<Void> recordGradeResult(String departmentId, double score, boolean passed) {
        String year = deriveAcademicYear();
        return reportRepository.findByDepartmentId(departmentId)
                .filter(r -> r.getAcademicYear().equals(year))
                .next()
                .switchIfEmpty(Mono.defer(() -> {
                    AcademicReport r = AcademicReport.create(departmentId, year, 0, 0, 0, null);
                    return reportRepository.save(r);
                }))
                .flatMap(existing -> {
                    int total   = existing.getTotalStudents() + 1;
                    int passed2 = existing.getPassedStudents() + (passed ? 1 : 0);
                    int failed  = total - passed2;
                    double prevAvg = existing.getAverageScore() != null ? existing.getAverageScore() : 0.0;
                    double newAvg  = ((prevAvg * existing.getTotalStudents()) + score) / total;

                    AcademicReport updated = new AcademicReport(
                            existing.getId(), existing.getDepartmentId(), existing.getAcademicYear(),
                            total, passed2, failed, newAvg, existing.getGeneratedAt(), existing.getGeneratedBy()
                    );
                    return reportRepository.save(updated);
                })
                .then();
    }

    private String deriveAcademicYear() {
        int year = LocalDate.now().getYear();
        int month = LocalDate.now().getMonthValue();
        int startYear = month >= 9 ? year : year - 1;
        return startYear + "-" + (startYear + 1);
    }
}
