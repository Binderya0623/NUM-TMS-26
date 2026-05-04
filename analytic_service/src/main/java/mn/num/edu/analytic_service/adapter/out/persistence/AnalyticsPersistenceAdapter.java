package mn.num.edu.analytic_service.adapter.out.persistence;

import mn.num.edu.analytic_service.application.port.out.AnalyticsRepositoryPort;
import mn.num.edu.analytic_service.domain.model.AnalyticsCounter;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class AnalyticsPersistenceAdapter implements AnalyticsRepositoryPort {

    private final AnalyticsCounterR2dbcRepository repository;

    public AnalyticsPersistenceAdapter(AnalyticsCounterR2dbcRepository repository) {
        this.repository = repository;
    }

    @Override
    public Mono<AnalyticsCounter> findByKey(String key) {
        return repository.findByMetricKey(key).map(this::toDomain);
    }

    @Override
    public Mono<AnalyticsCounter> save(AnalyticsCounter counter) {
        return repository.save(toEntity(counter)).map(this::toDomain);
    }

    @Override
    public Flux<AnalyticsCounter> findAll() {
        return repository.findAll().map(this::toDomain);
    }

    private AnalyticsCounterEntity toEntity(AnalyticsCounter c) {
        return new AnalyticsCounterEntity(c.getId(), c.getMetricKey(), c.getMetricValue(), c.getUpdatedAt());
    }

    private AnalyticsCounter toDomain(AnalyticsCounterEntity e) {
        return new AnalyticsCounter(e.getId(), e.getMetricKey(), e.getMetricValue(), e.getUpdatedAt());
    }
}
