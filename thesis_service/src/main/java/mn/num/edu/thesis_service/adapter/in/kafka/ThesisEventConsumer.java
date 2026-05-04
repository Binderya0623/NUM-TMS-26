package mn.num.edu.thesis_service.adapter.in.kafka;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mn.num.edu.thesis_service.application.port.out.ThesisRepositoryPort;
import mn.num.edu.thesis_service.application.service.ThesisApplicationService;
import mn.num.edu.thesis_service.domain.event.CommitteeAssignedEvent;
import mn.num.edu.thesis_service.domain.event.StudentRegisteredEvent;
import mn.num.edu.thesis_service.domain.model.Thesis;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class ThesisEventConsumer {

    private final ThesisApplicationService thesisApplicationService;
    private final ThesisRepositoryPort thesisRepositoryPort;

    public ThesisEventConsumer(ThesisApplicationService thesisApplicationService, ThesisRepositoryPort thesisRepositoryPort) {
        this.thesisApplicationService = thesisApplicationService;
        this.thesisRepositoryPort = thesisRepositoryPort;
    }

    @KafkaListener(topics = "user-created-events", groupId = "thesis-service", containerFactory = "studentRegisteredKafkaListenerContainerFactory")
    public void consumeUserCreated(StudentRegisteredEvent event) {
        if (event == null || event.getPayload() == null) {
            log.warn("Received null or invalid UserCreatedEvent");
            return;
        }

        StudentRegisteredEvent.Payload payload = event.getPayload();

        if (!"STUDENT".equals(payload.getSystemRole())) {
            log.info("Ignoring user-created event because role is not STUDENT. role={}", payload.getSystemRole());
            return;
        }

        if (!payload.isActive()) {
            log.info("Ignoring inactive student user. userId={}", payload.getUserId());
            return;
        }

        thesisApplicationService.handleStudentRegistered(event)
                .subscribe(
                        unused -> {},
                        error -> log.error("Kafka processing failed consumer student", error)
                );
    }
//    @KafkaListener(topics = "user-created-events", groupId = "thesis-service-group", containerFactory = "studentRegisteredKafkaListenerContainerFactory")
//    public void consumeStudentRegistered(StudentRegisteredEvent event) {
//        thesisApplicationService.handleStudentRegistered(event).subscribe();
//    }

    @KafkaListener(topics = "committee-student-assigned", groupId = "thesis-service-group", containerFactory = "committeeAssignedKafkaListenerContainerFactory")
    public void consumeCommitteeAssigned(CommitteeAssignedEvent event) {
        thesisApplicationService.handleCommitteeAssigned(event).subscribe(
                unused -> {},
                error -> log.error("Error processing event", error)
        );
    }
}
