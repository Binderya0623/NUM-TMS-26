package mn.num.edu.thesis_service.adapter.out.persistence;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface ThesisReportR2dbcRepository extends ReactiveCrudRepository<ThesisReportEntity, String> {

    Flux<ThesisReportEntity> findByThesisId(String thesisId);

    Flux<ThesisReportEntity> findByStudentId(String studentId);

    Flux<ThesisReportEntity> findByDefenseSessionId(String defenseSessionId);

    @Query("SELECT * FROM thesis_report WHERE thesis_id = :thesisId AND defense_session_id = :sessionId ORDER BY submission_number DESC LIMIT 1")
    Mono<ThesisReportEntity> findLatestByThesisAndSession(String thesisId, String sessionId);
}
