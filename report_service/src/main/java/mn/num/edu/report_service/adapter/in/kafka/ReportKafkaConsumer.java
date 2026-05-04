package mn.num.edu.report_service.adapter.in.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import mn.num.edu.report_service.application.service.ReportApplicationService;
import mn.num.edu.report_service.domain.event.FinalGradeCalculatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class ReportKafkaConsumer {

    private static final Logger log = LoggerFactory.getLogger(ReportKafkaConsumer.class);

    private final ReportApplicationService reportService;
    private final ObjectMapper objectMapper;

    public ReportKafkaConsumer(ReportApplicationService reportService, ObjectMapper objectMapper) {
        this.reportService = reportService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "final-grade-calculated", groupId = "report-service-group")
    public void consumeFinalGrade(String payload) {
        try {
            FinalGradeCalculatedEvent event = objectMapper.readValue(payload, FinalGradeCalculatedEvent.class);
            log.info("Consumed FinalGradeCalculatedEvent for student={}", event.studentId());

            boolean passed = event.totalScore() != null && event.totalScore() >= 60.0;
            double score   = event.totalScore() != null ? event.totalScore() : 0.0;

            reportService.recordGradeResult(null, score, passed)
                    .subscribe(
                            null,
                            err -> log.error("Failed to record grade result: {}", err.getMessage())
                    );
        } catch (Exception e) {
            log.error("Failed to deserialize FinalGradeCalculatedEvent: {}", e.getMessage());
        }
    }
}
