package com.tms.thesissystem.api;

import com.tms.thesissystem.application.service.WorkflowCommandService;
import com.tms.thesissystem.application.service.WorkflowQueryService;
import com.tms.thesissystem.domain.model.WeeklyTask;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/test/workflow")
public class WorkflowTestController {
    private final WorkflowCommandService commandService;
    private final WorkflowQueryService queryService;

    public WorkflowTestController(WorkflowCommandService commandService, WorkflowQueryService queryService) {
        this.commandService = commandService;
        this.queryService = queryService;
    }

    @GetMapping("/dashboard")
    public WorkflowQueryService.DashboardSnapshot dashboard() {
        return queryService.getDashboard();
    }

    @PostMapping("/student-topic")
    public WorkflowQueryService.DashboardSnapshot studentProposesTopic(@RequestBody StudentTopicRequest request) {
        commandService.proposeTopic(request.studentId(), request.title(), request.description(), request.program());
        return queryService.getDashboard();
    }

    @PostMapping("/teacher-topic")
    public WorkflowQueryService.DashboardSnapshot teacherProposesTopic(@RequestBody TeacherTopicRequest request) {
        commandService.createTeacherTopic(request.teacherId(), request.title(), request.description(), request.program());
        return queryService.getDashboard();
    }

    @PostMapping("/topic/{topicId}/select")
    public WorkflowQueryService.DashboardSnapshot studentSelectsTopic(@PathVariable Long topicId, @RequestBody StudentActionRequest request) {
        commandService.claimTopic(topicId, request.studentId());
        return queryService.getDashboard();
    }

    @PostMapping("/topic/{topicId}/teacher-approve")
    public WorkflowQueryService.DashboardSnapshot teacherApprovesTopic(@PathVariable Long topicId, @RequestBody DecisionActorRequest request) {
        commandService.teacherDecisionOnTopic(topicId, request.actorId(), true, request.note());
        return queryService.getDashboard();
    }

    @PostMapping("/topic/{topicId}/department-approve")
    public WorkflowQueryService.DashboardSnapshot departmentApprovesTopic(@PathVariable Long topicId, @RequestBody DepartmentTopicApproveRequest request) {
        commandService.departmentDecisionOnTopic(topicId, request.departmentId(), true, request.advisorTeacherId(), request.note());
        return queryService.getDashboard();
    }

    @PostMapping("/plan")
    public WorkflowQueryService.DashboardSnapshot studentCreatesPlan(@RequestBody PlanRequest request) {
        List<WeeklyTask> tasks = request.tasks().stream()
                .map(task -> new WeeklyTask(task.week(), task.title(), task.deliverable(), task.focus()))
                .toList();
        commandService.savePlan(request.studentId(), request.topicId(), tasks);
        return queryService.getDashboard();
    }

    @PostMapping("/plan/{planId}/submit")
    public WorkflowQueryService.DashboardSnapshot studentSubmitsPlan(@PathVariable Long planId, @RequestBody StudentActionRequest request) {
        commandService.submitPlan(planId, request.studentId());
        return queryService.getDashboard();
    }

    @PostMapping("/plan/{planId}/teacher-approve")
    public WorkflowQueryService.DashboardSnapshot teacherApprovesPlan(@PathVariable Long planId, @RequestBody DecisionActorRequest request) {
        commandService.teacherDecisionOnPlan(planId, request.actorId(), true, request.note());
        return queryService.getDashboard();
    }

    @PostMapping("/plan/{planId}/department-approve")
    public WorkflowQueryService.DashboardSnapshot departmentApprovesPlan(@PathVariable Long planId, @RequestBody DecisionActorRequest request) {
        commandService.departmentDecisionOnPlan(planId, request.actorId(), true, request.note());
        return queryService.getDashboard();
    }

    public record StudentTopicRequest(Long studentId, String title, String description, String program) { }
    public record TeacherTopicRequest(Long teacherId, String title, String description, String program) { }
    public record StudentActionRequest(Long studentId) { }
    public record DecisionActorRequest(Long actorId, String note) { }
    public record DepartmentTopicApproveRequest(Long departmentId, Long advisorTeacherId, String note) { }
    public record PlanRequest(Long studentId, Long topicId, List<PlanTaskRequest> tasks) { }
    public record PlanTaskRequest(int week, String title, String deliverable, String focus) { }
}
