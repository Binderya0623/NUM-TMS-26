package mn.num.edu.committee_service.adapter.in.kafka;

import lombok.RequiredArgsConstructor;
import mn.num.edu.committee_service.application.port.out.StudentSnapshot;
import mn.num.edu.committee_service.application.port.out.StudentSnapshotRepositoryPort;
import mn.num.edu.committee_service.application.port.out.TeacherSnapshot;
import mn.num.edu.committee_service.application.port.out.TeacherSnapshotRepositoryPort;
import mn.num.edu.committee_service.domain.event.UserCreatedEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserEventConsumer {

    private final TeacherSnapshotRepositoryPort teacherSnapshotRepositoryPort;
    private final StudentSnapshotRepositoryPort studentSnapshotRepositoryPort;

    @KafkaListener(topics = "user-created-events", groupId = "committee-service")
    public void consumeUserCreated(UserCreatedEvent event) {
        if (event == null || event.getPayload() == null) {
            return;
        }

        UserCreatedEvent.Payload payload = event.getPayload();

        if ("TEACHER".equals(payload.getSystemRole())) {
            TeacherSnapshot snapshot = new TeacherSnapshot(
                    payload.getUserId(),
                    payload.getDepartmentId(),
                    payload.isActive()
            );

            teacherSnapshotRepositoryPort.save(snapshot).subscribe();
        }

        if ("STUDENT".equals(payload.getSystemRole())) {
            StudentSnapshot snapshot = new StudentSnapshot(
                    payload.getUserId(),
                    payload.getDepartmentId(), payload.isActive()
            );

            studentSnapshotRepositoryPort.save(snapshot).subscribe();
        }
    }
}