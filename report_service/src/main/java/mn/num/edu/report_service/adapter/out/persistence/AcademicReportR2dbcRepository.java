package mn.num.edu.report_service.adapter.out.persistence;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface AcademicReportR2dbcRepository extends ReactiveCrudRepository<AcademicReportEntity, UUID> {
    Flux<AcademicReportEntity> findByDepartmentId(String departmentId);
    Flux<AcademicReportEntity> findByAcademicYear(String academicYear);
}
