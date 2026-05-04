package mn.num.edu.analytic_service.application.service;

import mn.num.edu.analytic_service.application.port.out.AnalyticsRepositoryPort;
import mn.num.edu.analytic_service.domain.model.AnalyticsCounter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

public class AnalyticsApplicationService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsApplicationService.class);

    private final AnalyticsRepositoryPort repository;

    public AnalyticsApplicationService(AnalyticsRepositoryPort repository) {
        this.repository = repository;
    }

    public Mono<Void> increment(String key) {
        return repository.findByKey(key)
                .switchIfEmpty(Mono.just(new AnalyticsCounter(UUID.randomUUID(), key, 0L, LocalDateTime.now())))
                .flatMap(counter -> repository.save(counter.increment()))
                .doOnSuccess(c -> log.info("Incremented metric: {} = {}", key, c.getMetricValue()))
                .then();
    }
}
