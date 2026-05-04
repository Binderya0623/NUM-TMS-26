package mn.num.edu.analytic_service.application.port.out;

import mn.num.edu.analytic_service.domain.model.AnalyticsCounter;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface AnalyticsRepositoryPort {
    Mono<AnalyticsCounter> findByKey(String key);
    Mono<AnalyticsCounter> save(AnalyticsCounter counter);
    Flux<AnalyticsCounter> findAll();
}
