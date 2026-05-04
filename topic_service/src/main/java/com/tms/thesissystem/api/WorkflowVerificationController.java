package com.tms.thesissystem.api;

import com.tms.thesissystem.application.service.WorkflowCommandService;
import com.tms.thesissystem.application.service.WorkflowQueryService;
import com.tms.thesissystem.domain.model.Topic;
import com.tms.thesissystem.domain.model.TopicStatus;
import com.tms.thesissystem.domain.model.WeeklyTask;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/verification")
public class WorkflowVerificationController {
    private final WorkflowQueryService queryService;
    private final WorkflowCommandService commandService;
    private final ApiResponseMapper apiResponseMapper;

    public WorkflowVerificationController(WorkflowQueryService queryService, WorkflowCommandService commandService, ApiResponseMapper apiResponseMapper) {
        this.queryService = queryService;
        this.commandService = commandService;
        this.apiResponseMapper = apiResponseMapper;
    }

    @GetMapping("/state")
    public ApiDtos.DashboardResponse state() {
        return apiResponseMapper.toDashboardResponse(queryService.getDashboard());
    }

    @GetMapping("/users")
    public List<ApiDtos.UserDto> users() {
        return queryService.getDashboard().users().stream().map(apiResponseMapper::toUserDto).toList();
    }

    @GetMapping("/topics")
    public ApiDtos.TopicStateResponse topics() {
        return apiResponseMapper.toWorkflowStateResponse(queryService.getDashboard()).topics();
    }

    @GetMapping("/plans")
    public ApiDtos.PlanStateResponse plans() {
        return apiResponseMapper.toWorkflowStateResponse(queryService.getDashboard()).plans();
    }

    @PostMapping("/topics/student-proposals")
    public ApiDtos.DashboardResponse studentProposesTopic(@RequestBody StudentTopicProposalRequest request) {
        commandService.proposeTopic(request.studentId(), request.title(), request.description(), request.program());
        return apiResponseMapper.toDashboardResponse(queryService.getDashboard());
    }

    @PostMapping("/topics/teacher-proposals")
    public ApiDtos.DashboardResponse teacherProposesTopic(@RequestBody TeacherTopicProposalRequest request) {
        commandService.createTeacherTopic(request.teacherId(), request.title(), request.description(), request.program());
        return apiResponseMapper.toDashboardResponse(queryService.getDashboard());
    }

    @PostMapping("/topics/selections")
    public ApiDtos.DashboardResponse studentSelectsApprovedTopic(@RequestBody TopicSelectionRequest request) {
        commandService.claimTopic(request.topicId(), request.studentId());
        return apiResponseMapper.toDashboardResponse(queryService.getDashboard());
    }

    @PostMapping("/topics/teacher-approvals")
    public ApiDtos.DashboardResponse teacherApprovesStudentTopic(@RequestBody TopicTeacherApprovalRequest request) {
        Long resolvedTopicId = resolvePendingTeacherTopicId(request);
        commandService.teacherDecisionOnTopic(resolvedTopicId, request.resolvedTeacherId(), request.approved(), request.note());
        return apiResponseMapper.toDashboardResponse(queryService.getDashboard());
    }

    @PostMapping("/topics/department-approvals")
    public ApiDtos.DashboardResponse departmentApprovesTopic(@RequestBody TopicDepartmentApprovalRequest request) {
        commandService.departmentDecisionOnTopic(
                request.topicId(),
                request.departmentId(),
                request.approved(),
                request.advisorTeacherId(),
                request.note()
        );
        return apiResponseMapper.toDashboardResponse(queryService.getDashboard());
    }

    @PostMapping("/plans")
    public ApiDtos.DashboardResponse studentCreatesPlan(@RequestBody StudentPlanRequest request) {
        List<WeeklyTask> tasks = request.tasks().stream()
                .map(task -> new WeeklyTask(task.week(), task.title(), task.deliverable(), task.focus()))
                .toList();
        commandService.savePlan(request.studentId(), request.topicId(), tasks);
        return apiResponseMapper.toDashboardResponse(queryService.getDashboard());
    }

    @PostMapping("/plans/submit")
    public ApiDtos.DashboardResponse studentSubmitsPlan(@RequestBody PlanSubmitRequest request) {
        commandService.submitPlan(request.planId(), request.studentId());
        return apiResponseMapper.toDashboardResponse(queryService.getDashboard());
    }

    @PostMapping("/plans/teacher-approvals")
    public ApiDtos.DashboardResponse teacherApprovesPlan(@RequestBody PlanApprovalRequest request) {
        commandService.teacherDecisionOnPlan(request.planId(), request.resolvedActorId(), request.approved(), request.note());
        return apiResponseMapper.toDashboardResponse(queryService.getDashboard());
    }

    @PostMapping("/plans/department-approvals")
    public ApiDtos.DashboardResponse departmentApprovesPlan(@RequestBody PlanApprovalRequest request) {
        commandService.departmentDecisionOnPlan(request.planId(), request.resolvedActorId(), request.approved(), request.note());
        return apiResponseMapper.toDashboardResponse(queryService.getDashboard());
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public void handleDomainError(RuntimeException exception) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage(), exception);
    }

    private Long resolvePendingTeacherTopicId(TopicTeacherApprovalRequest request) {
        if (request.resolvedTopicId() != null) {
            return request.resolvedTopicId();
        }
        if (request.topicTitle() == null || request.topicTitle().isBlank()) {
            throw new IllegalArgumentException("Сэдэвийн id эсвэл нэр дамжуулаагүй байна.");
        }
        Optional<Topic> matchedTopic = queryService.getDashboard().topics().stream()
                .filter(topic -> topic.status() == TopicStatus.PENDING_TEACHER_APPROVAL)
                .filter(topic -> request.topicTitle().equalsIgnoreCase(topic.title()))
                .findFirst();
        return matchedTopic.map(Topic::id)
                .orElseThrow(() -> new IllegalArgumentException("Сэдэв олдсонгүй. Нэр: " + request.topicTitle()));
    }

    public record StudentTopicProposalRequest(Long studentId, String title, String description, String program) { }
    public record TeacherTopicProposalRequest(Long teacherId, String title, String description, String program) { }
    public record TopicSelectionRequest(Long topicId, Long studentId) { }
    public record TopicTeacherApprovalRequest(Long topicId, Long entityId, Long teacherId, Long actorId, String topicTitle, boolean approved, String note) {
        public Long resolvedTopicId() {
            return topicId != null ? topicId : entityId;
        }

        public Long resolvedTeacherId() {
            return teacherId != null ? teacherId : actorId;
        }
    }
    public record TopicDepartmentApprovalRequest(Long topicId, Long departmentId, boolean approved, Long advisorTeacherId, String note) { }
    public record StudentPlanRequest(Long studentId, Long topicId, List<WeeklyTaskRequest> tasks) { }
    public record WeeklyTaskRequest(int week, String title, String deliverable, String focus) { }
    public record PlanSubmitRequest(Long planId, Long studentId) { }
    public record PlanApprovalRequest(Long planId, Long actorId, Long teacherId, Long departmentId, boolean approved, String note) {
        public Long resolvedActorId() {
            if (actorId != null) {
                return actorId;
            }
            if (teacherId != null) {
                return teacherId;
            }
            return departmentId;
        }
    }

}
