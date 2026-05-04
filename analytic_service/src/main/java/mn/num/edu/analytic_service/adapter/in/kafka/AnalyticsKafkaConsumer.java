package mn.num.edu.analytic_service.adapter.in.kafka;

import mn.num.edu.analytic_service.application.service.AnalyticsApplicationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class AnalyticsKafkaConsumer {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsKafkaConsumer.class);

    private final AnalyticsApplicationService analyticsService;

    public AnalyticsKafkaConsumer(AnalyticsApplicationService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @KafkaListener(topics = "thesis-approved", groupId = "analytic-service-group")
    public void onThesisApproved(String payload) {
        log.info("Analytics: thesis-approved event received");
        analyticsService.increment("total_approved_theses").subscribe();
        analyticsService.increment("total_theses").subscribe();
    }

    @KafkaListener(topics = "final-grade-calculated", groupId = "analytic-service-group")
    public void onFinalGradeCalculated(String payload) {
        log.info("Analytics: final-grade-calculated event received");
        analyticsService.increment("total_grades_calculated").subscribe();
    }

    @KafkaListener(topics = "evaluation-completed", groupId = "analytic-service-group")
    public void onEvaluationCompleted(String payload) {
        log.info("Analytics: evaluation-completed event received");
        analyticsService.increment("total_evaluations_completed").subscribe();
    }

    @KafkaListener(topics = "workflow-completed", groupId = "analytic-service-group")
    public void onWorkflowCompleted(String payload) {
        log.info("Analytics: workflow-completed event received");
        analyticsService.increment("total_workflows_completed").subscribe();
    }

    @KafkaListener(topics = "report-submitted", groupId = "analytic-service-group")
    public void onReportSubmitted(String payload) {
        log.info("Analytics: report-submitted event received");
        analyticsService.increment("total_reports_submitted").subscribe();
    }
}
