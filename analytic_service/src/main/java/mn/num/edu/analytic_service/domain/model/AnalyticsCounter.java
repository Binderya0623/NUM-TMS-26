package mn.num.edu.analytic_service.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class AnalyticsCounter {
    private UUID id;
    private String metricKey;
    private long metricValue;
    private LocalDateTime updatedAt;

    public AnalyticsCounter(UUID id, String metricKey, long metricValue, LocalDateTime updatedAt) {
        this.id = id;
        this.metricKey = metricKey;
        this.metricValue = metricValue;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public String getMetricKey() { return metricKey; }
    public long getMetricValue() { return metricValue; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public AnalyticsCounter increment() {
        return new AnalyticsCounter(id, metricKey, metricValue + 1, LocalDateTime.now());
    }
}
