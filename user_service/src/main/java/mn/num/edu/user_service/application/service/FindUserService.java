package mn.num.edu.user_service.application.service;

import mn.num.edu.user_service.application.port.in.FindUserUseCase;
import mn.num.edu.user_service.application.port.out.UserRepositoryPort;
import mn.num.edu.user_service.domain.model.User;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class FindUserService implements FindUserUseCase {

    private final UserRepositoryPort userRepositoryPort;

    public FindUserService(UserRepositoryPort userRepositoryPort) {
        this.userRepositoryPort = userRepositoryPort;
    }

    @Override
    public Mono<User> findById(String id) {
        return userRepositoryPort.findById(id);
    }

    @Override
    public Flux<User> findAll() {
        return userRepositoryPort.findAll();
    }

    @Override
    public Mono<User> findByName(String name) {
        return userRepositoryPort.findById(name);
    }

    @Override
    public Flux<User> findStudents(String departmentId) {
        return userRepositoryPort.findStudents(departmentId);
    }

    @Override
    public Flux<User> findTeachers(String departmentId) {
        return userRepositoryPort.findTeachers(departmentId);
    }

    @Override
    public Flux<User> findExternalExperts(String departmentId) {
        return userRepositoryPort.findExternalExperts(departmentId);
    }
}