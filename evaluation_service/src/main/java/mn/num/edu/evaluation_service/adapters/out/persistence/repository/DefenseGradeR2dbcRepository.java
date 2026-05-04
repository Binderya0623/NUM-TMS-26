package mn.num.edu.evaluation_service.adapters.out.persistence.repository;

import mn.num.edu.evaluation_service.adapters.out.persistence.entity.DefenseGradeEntity;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface DefenseGradeR2dbcRepository extends ReactiveCrudRepository<DefenseGradeEntity, UUID> {

    Flux<DefenseGradeEntity> findByDefenseSessionId(String defenseSessionId);

    Flux<DefenseGradeEntity> findByDefenseSessionIdAndStudentId(String defenseSessionId, String studentId);

    Mono<DefenseGradeEntity> findByDefenseSessionIdAndThesisIdAndEvaluatorId(String sessionId, String thesisId, String evaluatorId);

    Flux<DefenseGradeEntity> findByEvaluatorId(String evaluatorId);

    Flux<DefenseGradeEntity> findByStudentId(String studentId);

    @Query("SELECT * FROM defense_grade WHERE defense_session_id = :sessionId AND student_id = :studentId AND is_submitted = TRUE")
    Flux<DefenseGradeEntity> findSubmittedBySessionAndStudent(String sessionId, String studentId);
}
