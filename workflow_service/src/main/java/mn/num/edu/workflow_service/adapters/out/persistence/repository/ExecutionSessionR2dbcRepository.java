package mn.num.edu.workflow_service.adapters.out.persistence.repository;

import mn.num.edu.workflow_service.adapters.out.persistence.entity.ThesisExecutionSessionEntity;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface ExecutionSessionR2dbcRepository extends ReactiveCrudRepository<ThesisExecutionSessionEntity, String> {

    Flux<ThesisExecutionSessionEntity> findByDepartmentId(String departmentId);

    Flux<ThesisExecutionSessionEntity> findByStatus(String status);

    @Query("SELECT * FROM thesis_execution_session WHERE department_id = :deptId AND status = 'ACTIVE' LIMIT 1")
    Mono<ThesisExecutionSessionEntity> findActiveByDepartment(String deptId);

    @Query("SELECT * FROM thesis_execution_session WHERE status = 'ACTIVE' LIMIT 1")
    Mono<ThesisExecutionSessionEntity> findActive();
}
