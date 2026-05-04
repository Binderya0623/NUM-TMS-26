package mn.num.edu.workflow_service.adapters.in.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mn.num.edu.workflow_service.domain.event.CommitteeCreatedEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkflowKafkaConsumer {

    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "committee-created", groupId = "workflow-service")
    public void handleCommitteeCreated(String payload) {
        try {
            log.info("Received raw payload: {}", payload);

//            CommitteeCreatedEvent event =
//                    objectMapper.readValue(payload, CommitteeCreatedEvent.class);
//
//            log.info("Consumed CommitteeCreated: {}", event);

        } catch (Exception e) {
            log.error("Failed to parse payload: {}", payload, e);
        }
    }

    @KafkaListener(topics = "thesis-approved", groupId = "workflow-service")
    public void handleThesisApproved(String payload) {
        log.info("Consumed ThesisApproved: {}", payload);
    }

    @KafkaListener(topics = "report-submitted", groupId = "workflow-service")
    public void handleReportSubmitted(String payload) {
        log.info("Consumed ReportSubmitted: {}", payload);
    }

    @KafkaListener(topics = "evaluation-submitted", groupId = "workflow-service")
    public void handleEvaluationSubmitted(String payload) {
        log.info("Consumed EvaluationSubmitted: {}", payload);
    }
}