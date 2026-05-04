package mn.num.edu.analytic_service.adapter.out.persistence;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface AnalyticsCounterR2dbcRepository extends ReactiveCrudRepository<AnalyticsCounterEntity, UUID> {
    Mono<AnalyticsCounterEntity> findByMetricKey(String metricKey);
}
