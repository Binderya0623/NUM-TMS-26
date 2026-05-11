package mn.num.edu.committee_service.adapter.out.kafka;

import mn.num.edu.committee_service.application.port.out.CommitteeEventPublisherPort;
import mn.num.edu.committee_service.domain.event.CommitteeCreatedEvent;
import mn.num.edu.committee_service.domain.event.StudentAssignedEvent;
import mn.num.edu.committee_service.domain.event.TeacherAssignedEvent;
import mn.num.edu.committee_service.domain.model.CommitteeRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class KafkaCommitteeEventPublisherAdapter implements CommitteeEventPublisherPort {

    private static final Logger log = LoggerFactory.getLogger(KafkaCommitteeEventPublisherAdapter.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.kafka.topic.committee-created:committee-created}")
    private String committeeCreatedTopic;

    @Value("${app.kafka.topic.teacher-assigned:committee-teacher-assigned}")
    private String teacherAssignedTopic;

    @Value("${app.kafka.topic.student-assigned:committee-student-assigned}")
    private String studentAssignedTopic;

    public KafkaCommitteeEventPublisherAdapter(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public Mono<Void> publishCommitteeCreate(CommitteeCreatedEvent event) {

        log.info("Publishing CommitteeCreatedEvent. topic={}, committeeId={}",
                committeeCreatedTopic, event.committeeId());

        return Mono.fromFuture(
                        kafkaTemplate.send(committeeCreatedTopic, event.committeeId(), event)
                )
                .doOnSuccess(result -> log.info("Event published successfully. topic={}, offset={}",
                        committeeCreatedTopic,
                        result.getRecordMetadata().offset()))
                .doOnError(e -> log.error("Failed to publish CommitteeCreatedEvent. committeeId={}",
                        event.committeeId(), e))
                .then();
    }

    @Override
    public Mono<Void> publishTeacherAssigned(String committeeId, String teacherId, CommitteeRole role, String departmentId) {

        log.info("Publishing TeacherAssignedEvent. topic={}, committeeId={}, teacherId={}, role={}",
                teacherAssignedTopic, committeeId, teacherId, role);

        TeacherAssignedEvent event = new TeacherAssignedEvent(
                committeeId,
                "",
                teacherId,
                role,
                departmentId,
                java.time.Instant.now()
        );

        return Mono.fromFuture(
                        kafkaTemplate.send(
                                teacherAssignedTopic,
                                teacherId,
                                event
                        )
                )
                .doOnSuccess(result -> log.info("Event published successfully. topic={}, teacherId={}, offset={}",
                        teacherAssignedTopic,
                        teacherId,
                        result.getRecordMetadata().offset()))
                .doOnError(e -> log.error("Failed to publish TeacherAssignedEvent. committeeId={}, teacherId={}",
                        committeeId, teacherId, e))
                .then();
    }

    @Override
    public Mono<Void> publishStudentAssigned(String committeeId, String studentId, String departmentId) {

        log.info("Publishing StudentAssignedEvent. topic={}, committeeId={}, studentId={}",
                studentAssignedTopic, committeeId, studentId);

        StudentAssignedEvent event = new StudentAssignedEvent(
                committeeId,
                "",
                studentId,
                departmentId,
                java.time.Instant.now()
        );

        return Mono.fromFuture(
                        kafkaTemplate.send(
                                studentAssignedTopic,
                                studentId,
                                event
                        )
                )
                .doOnSuccess(result -> log.info("Event published successfully. topic={}, studentId={}, offset={}",
                        studentAssignedTopic,
                        studentId,
                        result.getRecordMetadata().offset()))
                .doOnError(e -> log.error("Failed to publish StudentAssignedEvent. committeeId={}, studentId={}",
                        committeeId, studentId, e))
                .then();
    }

    @Override
    public Mono<Void> publishTeacherAssigned(TeacherAssignedEvent event) {

        log.info("Publishing TeacherAssignedEvent (direct). topic={}, teacherId={}",
                teacherAssignedTopic, event.teacherId());

        return Mono.fromFuture(
                        kafkaTemplate.send(
                                teacherAssignedTopic,
                                event.teacherId(),
                                event
                        )
                )
                .doOnSuccess(result -> log.info("Event published successfully. topic={}, teacherId={}, offset={}",
                        teacherAssignedTopic,
                        event.teacherId(),
                        result.getRecordMetadata().offset()))
                .doOnError(e -> log.error("Failed to publish TeacherAssignedEvent (direct). teacherId={}",
                        event.teacherId(), e))
                .then();
    }

    @Override
    public Mono<Void> publishStudentAssigned(StudentAssignedEvent event) {

        log.info("Publishing StudentAssignedEvent (direct). topic={}, studentId={}",
                studentAssignedTopic, event.studentId());

        return Mono.fromFuture(
                        kafkaTemplate.send(
                                studentAssignedTopic,
                                event.studentId(),
                                event
                        )
                )
                .doOnSuccess(result -> log.info("Event published successfully. topic={}, studentId={}, offset={}",
                        studentAssignedTopic,
                        event.studentId(),
                        result.getRecordMetadata().offset()))
                .doOnError(e -> log.error("Failed to publish StudentAssignedEvent (direct). studentId={}",
                        event.studentId(), e))
                .then();
    }
}