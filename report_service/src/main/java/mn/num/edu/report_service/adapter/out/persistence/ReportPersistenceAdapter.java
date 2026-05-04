package mn.num.edu.report_service.adapter.out.persistence;

import mn.num.edu.report_service.application.port.out.AcademicReportRepositoryPort;
import mn.num.edu.report_service.domain.model.AcademicReport;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class ReportPersistenceAdapter implements AcademicReportRepositoryPort {

    private final AcademicReportR2dbcRepository repository;

    public ReportPersistenceAdapter(AcademicReportR2dbcRepository repository) {
        this.repository = repository;
    }

    @Override
    public Mono<AcademicReport> save(AcademicReport r) {
        return repository.save(toEntity(r)).map(this::toDomain);
    }

    @Override
    public Mono<AcademicReport> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Flux<AcademicReport> findAll() {
        return repository.findAll().map(this::toDomain);
    }

    @Override
    public Flux<AcademicReport> findByDepartmentId(String departmentId) {
        return repository.findByDepartmentId(departmentId).map(this::toDomain);
    }

    @Override
    public Flux<AcademicReport> findByAcademicYear(String academicYear) {
        return repository.findByAcademicYear(academicYear).map(this::toDomain);
    }

    private AcademicReportEntity toEntity(AcademicReport r) {
        return new AcademicReportEntity(r.getId(), r.getDepartmentId(), r.getAcademicYear(),
                r.getTotalStudents(), r.getPassedStudents(), r.getFailedStudents(),
                r.getAverageScore(), r.getGeneratedAt(), r.getGeneratedBy());
    }

    private AcademicReport toDomain(AcademicReportEntity e) {
        return new AcademicReport(e.getId(), e.getDepartmentId(), e.getAcademicYear(),
                e.getTotalStudents(), e.getPassedStudents(), e.getFailedStudents(),
                e.getAverageScore(), e.getGeneratedAt(), e.getGeneratedBy());
    }
}
