package mn.num.edu.workflow_service.adapters.out.persistence.repository;

import mn.num.edu.workflow_service.adapters.out.persistence.entity.DefenseSessionEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface DefenseSessionR2dbcRepository extends ReactiveCrudRepository<DefenseSessionEntity, String> {

    Flux<DefenseSessionEntity> findByCommitteeId(String committeeId);

    Flux<DefenseSessionEntity> findByDepartmentId(String departmentId);

    Flux<DefenseSessionEntity> findByStatus(String status);

    Flux<DefenseSessionEntity> findByStageType(String stageType);

    Flux<DefenseSessionEntity> findBySupervisorId(String supervisorId);

    Mono<DefenseSessionEntity> findBySupervisorIdAndStageType(String supervisorId, String stageType);

    Mono<DefenseSessionEntity> findByCommitteeIdAndStageType(String committeeId, String stageType);
}
