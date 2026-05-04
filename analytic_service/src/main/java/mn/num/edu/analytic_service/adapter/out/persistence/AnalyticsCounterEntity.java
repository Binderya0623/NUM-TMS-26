package mn.num.edu.analytic_service.adapter.out.persistence;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("analytics_counters")
public class AnalyticsCounterEntity {

    @Id
    private UUID id;
    private String metricKey;
    private long metricValue;
    private LocalDateTime updatedAt;

    public AnalyticsCounterEntity() {}

    public AnalyticsCounterEntity(UUID id, String metricKey, long metricValue, LocalDateTime updatedAt) {
        this.id = id;
        this.metricKey = metricKey;
        this.metricValue = metricValue;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public String getMetricKey() { return metricKey; }
    public long getMetricValue() { return metricValue; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
