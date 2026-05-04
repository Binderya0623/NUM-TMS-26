package mn.num.edu.committee_service.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import mn.num.edu.committee_service.application.port.out.*;
import mn.num.edu.committee_service.domain.model.CommitteeRole;
import mn.num.edu.committee_service.domain.model.CommitteeTeacher;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import lombok.RequiredArgsConstructor;
import mn.num.edu.committee_service.application.port.out.CommitteeTeacherRepositoryPort;
import mn.num.edu.committee_service.domain.model.Committee;
import mn.num.edu.committee_service.domain.model.CommitteeRole;
import mn.num.edu.committee_service.domain.model.CommitteeStudent;
import mn.num.edu.committee_service.domain.model.CommitteeTeacher;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class R2dbcStudentSnapshotRepositoryAdapter implements StudentSnapshotRepositoryPort {

    private final StudentSnapshotR2dbcRepository repository;


    @Override
    public Mono<StudentSnapshot> save(StudentSnapshot student) {
        return repository.save(student);
    }
}
@Component
@RequiredArgsConstructor
 class R2dbcTeacherSnapshotRepositoryAdapter implements TeacherSnapshotRepositoryPort {

    private final TeacherSnapshotR2dbcRepository repository;


    @Override
    public Mono<TeacherSnapshot> save(TeacherSnapshot teacher) {
        return repository.save(teacher);
    }

    @Override
    public Mono<TeacherSnapshot> findByTeacherId(String teacherId) {
        return repository.findById(teacherId);
    }
}
