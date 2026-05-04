package mn.num.edu.thesis_service.adapter.out.persistence;

import mn.num.edu.thesis_service.application.port.out.ThesisRepositoryPort;
import mn.num.edu.thesis_service.domain.model.Thesis;
import mn.num.edu.thesis_service.domain.model.ThesisStatus;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class ThesisPersistenceAdapter implements ThesisRepositoryPort {

    private final ThesisR2dbcRepository repository;

    public ThesisPersistenceAdapter(ThesisR2dbcRepository repository) {
        this.repository = repository;
    }

    @Override
    public Mono<Thesis> save(Thesis thesis) {
        ThesisEntity entity = toEntity(thesis);

        if (thesis.isNew()) {
            entity.markNew();
        } else {
            entity.markNotNew();
        }

        return repository.save(entity)
                .map(this::toDomain);
    }

    @Override
    public Mono<Thesis> findById(String thesisId) {
        return repository.findById(thesisId).map(this::toDomain);
    }

    @Override
    public Flux<Thesis> findAll() {
        return repository.findAll().map(this::toDomain);
    }

    @Override
    public Mono<Thesis> findByStudentId(String studentId) {
        return repository.findByStudentId(studentId).map(this::toDomain);
    }

    private ThesisEntity toEntity(Thesis thesis) {
        ThesisEntity entity = new ThesisEntity(
                thesis.getId(),
                thesis.getStudentId(),
                thesis.getSupervisorId(),
                thesis.getCommitteeId(),
                thesis.getTitleMn(),
                thesis.getTitleEn(),
                thesis.getDescription(),
                thesis.getStatus().name(),
                thesis.getCreatedAt(),
                thesis.getUpdatedAt()
        );

        if (thesis.isNew()) {
            entity.markNew();
        } else {
            entity.markNotNew();
        }

        return entity;
    }

    private Thesis toDomain(ThesisEntity entity) {
        return new Thesis(
                entity.getId(),
                entity.getStudentId(),
                entity.getSupervisorId(),
                entity.getCommitteeId(),
                entity.getTitleMn(),
                entity.getTitleEn(),
                entity.getDescription(),
                ThesisStatus.valueOf(entity.getStatus()),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}