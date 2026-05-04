package mn.num.edu.user_service.adapter.in.web.controller;

import jakarta.validation.Valid;
import mn.num.edu.user_service.adapter.in.web.request.CreateDepartmentRequest;
import mn.num.edu.user_service.adapter.in.web.request.CreateExternalExpertRequest;
import mn.num.edu.user_service.adapter.in.web.request.CreateStudentRequest;
import mn.num.edu.user_service.adapter.in.web.request.CreateTeacherRequest;
import mn.num.edu.user_service.adapter.in.web.request.CreateUserRequest;
import mn.num.edu.user_service.application.dto.CreateDepartmentCommand;
import mn.num.edu.user_service.application.dto.CreateExternalExpertCommand;
import mn.num.edu.user_service.application.dto.CreateStudentCommand;
import mn.num.edu.user_service.application.dto.CreateTeacherCommand;
import mn.num.edu.user_service.application.dto.CreateUserCommand;
import mn.num.edu.user_service.adapter.out.persistence.StudentR2dbcRepository;
import mn.num.edu.user_service.adapter.out.persistence.UserR2dbcRepository;
import mn.num.edu.user_service.application.port.in.*;
import mn.num.edu.user_service.application.port.out.DepartmentRepositoryPort;
import mn.num.edu.user_service.domain.model.Department;
import mn.num.edu.user_service.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final CreateStudentUseCase createStudentUseCase;
    private final CreateTeacherUseCase createTeacherUseCase;
    private final CreateDepartmentUseCase createDepartmentUseCase;
    private final CreateExternalExpertUseCase createExternalExpertUseCase;
    private final FindUserUseCase findUserUseCase;
    private final UserR2dbcRepository userR2dbcRepository;
    private final StudentR2dbcRepository studentR2dbcRepository;
    private final DepartmentRepositoryPort departmentRepositoryPort;

    public UserController(
            CreateStudentUseCase createStudentUseCase,
            CreateTeacherUseCase createTeacherUseCase,
            CreateDepartmentUseCase createDepartmentUseCase,
            CreateExternalExpertUseCase createExternalExpertUseCase,
            FindUserUseCase findUserUseCase,
            UserR2dbcRepository userR2dbcRepository,
            StudentR2dbcRepository studentR2dbcRepository,
            DepartmentRepositoryPort departmentRepositoryPort
    ) {
        this.createStudentUseCase = createStudentUseCase;
        this.createTeacherUseCase = createTeacherUseCase;
        this.createDepartmentUseCase = createDepartmentUseCase;
        this.createExternalExpertUseCase = createExternalExpertUseCase;
        this.findUserUseCase = findUserUseCase;
        this.userR2dbcRepository = userR2dbcRepository;
        this.studentR2dbcRepository = studentR2dbcRepository;
        this.departmentRepositoryPort = departmentRepositoryPort;
    }

    @PostMapping("/students")
    public Mono<ResponseEntity<User>> createStudent(
            @Valid @RequestBody CreateStudentRequest request
    ) {
        log.info("Received create student request. email={}, studentId={}, departmentId={}",
                request.email(), request.studentId(), request.departmentId());

        CreateStudentCommand command = new CreateStudentCommand(
                request.firstName(),
                request.lastName(),
                request.email(),
                request.studentId(),
                request.departmentId(),
                request.major()
        );

        return createStudentUseCase.execute(command)
                .map(savedUser -> {
                    log.info("Student created successfully. userId={}", savedUser.getId());
                    return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
                });
    }

    @PostMapping("/teachers")
    public Mono<ResponseEntity<User>> createTeacher(
            @Valid @RequestBody CreateTeacherRequest request
    ) {
        log.info("Received create teacher request. email={}, teacherCode={}, departmentId={}",
                request.email(), request.departmentId());

        CreateTeacherCommand command = new CreateTeacherCommand(
                request.firstName(),
                request.lastName(),
                request.email(),
                request.departmentId(),
                request.position()
        );

        return createTeacherUseCase.execute(command)
                .map(savedUser -> {
                    log.info("Teacher created successfully. userId={}", savedUser.getId());
                    return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
                });
    }

    @PostMapping("/departments")
    public Mono<ResponseEntity<User>> createDepartment(
            @Valid @RequestBody CreateDepartmentRequest request
    ) {
        log.info("Received create Department request. email={}, departmentId={}");

        CreateDepartmentCommand command = new CreateDepartmentCommand(
                request.firstName(),
                request.lastName(),
                request.email(),
                request.departmentId(),
                request.departmentName()
        );

        return createDepartmentUseCase.execute(command)
                .map(savedUser -> {
                    log.info("Department created successfully. userId={}", savedUser.getId());
                    return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
                });
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<User>> findUserById(@PathVariable String id) {
        log.info("Received find user request. userId={}", id);

        return findUserUseCase.findById(id)
                .map(user -> {
                    log.info("User found. userId={}", id);
                    return ResponseEntity.ok(user);
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    @GetMapping("/all")
    public Flux<User> findAll() {
        log.info("Received find user request. All user");
        return findUserUseCase.findAll();
    }

    @GetMapping("/students")
    public Flux<Map<String, Object>> findStudents(@RequestParam(required = false) String departmentId) {
        log.info("Fetching students. departmentId={}", departmentId);
        return findUserUseCase.findStudents(departmentId)
                .flatMap(user -> studentR2dbcRepository.findByUserId(user.getId())
                        .map(student -> {
                            Map<String, Object> m = new HashMap<>();
                            m.put("id", user.getId());
                            m.put("firstName", user.getFirstName());
                            m.put("lastName", user.getLastName());
                            m.put("email", user.getEmail());
                            m.put("departmentId", user.getDepartmentId());
                            m.put("systemRole", user.getSystemRole());
                            m.put("studentId", student.getStudentId());
                            m.put("major", student.getMajor());
                            return m;
                        })
                        .defaultIfEmpty(userToMap(user)));
    }

    private Map<String, Object> userToMap(User user) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", user.getId());
        m.put("firstName", user.getFirstName());
        m.put("lastName", user.getLastName());
        m.put("email", user.getEmail());
        m.put("departmentId", user.getDepartmentId());
        m.put("systemRole", user.getSystemRole());
        return m;
    }

    @GetMapping("/teachers")
    public Flux<User> findTeachers(@RequestParam(required = false) String departmentId) {
        log.info("Fetching teachers. departmentId={}", departmentId);
        return findUserUseCase.findTeachers(departmentId);
    }

    @PostMapping("/external-experts")
    public Mono<ResponseEntity<User>> createExternalExpert(
            @Valid @RequestBody CreateExternalExpertRequest request
    ) {
        log.info("Received create external expert request. email={}", request.email());
        CreateExternalExpertCommand command = new CreateExternalExpertCommand(
                request.firstName(),
                request.lastName(),
                request.email(),
                request.departmentId(),
                request.organization(),
                request.expertise(),
                request.password()
        );
        return createExternalExpertUseCase.execute(command)
                .map(savedUser -> ResponseEntity.status(HttpStatus.CREATED).body(savedUser));
    }

    @GetMapping("/external-experts")
    public Flux<User> findExternalExperts(@RequestParam(required = false) String departmentId) {
        log.info("Fetching external experts. departmentId={}", departmentId);
        return findUserUseCase.findExternalExperts(departmentId);
    }

    @GetMapping("/departments")
    public Flux<Department> findDepartments() {
        log.info("Fetching departments.");
        return departmentRepositoryPort.findAll();
    }

    @GetMapping("/departments/{id}")
    public Mono<ResponseEntity<Department>> findDepartmentById(@PathVariable String id) {
        return departmentRepositoryPort.findById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-email")
    public Mono<ResponseEntity<User>> findByEmail(@RequestParam String email) {
        log.info("Received find user by email request. email={}", email);
        return userR2dbcRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(user))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}