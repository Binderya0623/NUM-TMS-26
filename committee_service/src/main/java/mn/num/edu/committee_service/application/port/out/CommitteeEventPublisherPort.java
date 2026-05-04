package mn.num.edu.committee_service.application.port.out;

import mn.num.edu.committee_service.domain.event.CommitteeCreatedEvent;
import mn.num.edu.committee_service.domain.event.StudentAssignedEvent;
import mn.num.edu.committee_service.domain.event.TeacherAssignedEvent;
import mn.num.edu.committee_service.domain.model.CommitteeRole;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface CommitteeEventPublisherPort {
    Mono<Void> publishCommitteeCreate(CommitteeCreatedEvent event);

    Mono<Void> publishTeacherAssigned(String committeeId, String teacherId, CommitteeRole role, String departmentId);
    Mono<Void> publishStudentAssigned(String committeeId, String studentId, String departmentId);

    Mono<Void> publishTeacherAssigned(TeacherAssignedEvent event);
    Mono<Void> publishStudentAssigned(StudentAssignedEvent event);
}