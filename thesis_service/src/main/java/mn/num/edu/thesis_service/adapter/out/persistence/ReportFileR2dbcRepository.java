package mn.num.edu.thesis_service.adapter.out.persistence;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface ReportFileR2dbcRepository extends ReactiveCrudRepository<ReportFileEntity, String> {
    Flux<ReportFileEntity> findByReportId(String reportId);
}
