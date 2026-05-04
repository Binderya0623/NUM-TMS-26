package mn.num.edu.analytic_service.adapter.in.web;

import mn.num.edu.analytic_service.application.port.out.AnalyticsRepositoryPort;
import mn.num.edu.analytic_service.domain.model.AnalyticsCounter;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsRepositoryPort repository;

    public AnalyticsController(AnalyticsRepositoryPort repository) {
        this.repository = repository;
    }

    @GetMapping("/overview")
    public Mono<Map<String, Long>> getOverview() {
        return repository.findAll()
                .collectMap(AnalyticsCounter::getMetricKey, AnalyticsCounter::getMetricValue);
    }

    @GetMapping("/counters")
    public Flux<AnalyticsCounter> getAll() {
        return repository.findAll();
    }

    @GetMapping("/counters/{key}")
    public Mono<AnalyticsCounter> getByKey(@PathVariable String key) {
        return repository.findByKey(key);
    }
}
