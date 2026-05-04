package com.tms.thesissystem;

import com.tms.thesissystem.api.ApiDtos;
import com.tms.thesissystem.api.AuthController;
import com.tms.thesissystem.api.SystemController;
import com.tms.thesissystem.api.WorkflowController;
import com.tms.thesissystem.api.WorkflowVerificationController;
import com.tms.thesissystem.application.service.WorkflowQueryService;
import com.tms.thesissystem.domain.model.PlanStatus;
import com.tms.thesissystem.domain.model.TopicStatus;
import com.tms.thesissystem.domain.model.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Import(TestWorkflowRepositoryConfig.class)
class ThesisSystemApplicationTests {

    @Autowired
    private WorkflowController workflowController;

    @Autowired
    private WorkflowQueryService workflowQueryService;

    @Autowired
    private SystemController systemController;

    @Autowired
    private WorkflowVerificationController workflowVerificationController;

    @Autowired
    private AuthController authController;

    @Test
    void dashboardLoads() {
        ApiDtos.DashboardResponse snapshot = workflowController.dashboard();
        assertNotNull(snapshot);
        assertFalse(snapshot.users().isEmpty());
        assertFalse(snapshot.topics().isEmpty());
    }

    @Test
    void topicProposalCreatesPendingTeacherApproval() {
        Long studentId = workflowQueryService.getDashboard().users().stream()
                .filter(user -> user.role() == UserRole.STUDENT)
                .findFirst()
                .orElseThrow()
                .id();
        ApiDtos.DashboardResponse snapshot = workflowController.proposeTopic(
                new WorkflowController.TopicProposalRequest(studentId, "Distributed Thesis Governance", "Workflow orchestration", "B.SE")
        );
        assertNotNull(snapshot);
        assertFalse(snapshot.topics().isEmpty());
    }

    @Test
    void databaseStatusEndpointExists() {
        assertNotNull(systemController.databaseStatus());
    }

    @Test
    void loginWorksWithUsernameAndPassword() {
        ApiDtos.LoginResponse response = authController.login(new AuthController.LoginRequest("anu", "123456"));
        assertNotNull(response);
        assertEquals(true, response.ok());
        assertNotNull(response.user());
        assertEquals("student", response.user().role());
        assertEquals("anu", response.user().username());
    }

    @Test
    void loginWorksWithTemuulenUsername() {
        ApiDtos.LoginResponse response = authController.login(new AuthController.LoginRequest("Temuulen", "123456"));
        assertNotNull(response);
        assertTrue(response.ok());
        assertNotNull(response.user());
        assertEquals("student", response.user().role());
    }

    @Test
    void loginWorksWithDepartmentAliasUsername() {
        ApiDtos.LoginResponse response = authController.login(new AuthController.LoginRequest("se-dept", "123456"));
        assertNotNull(response);
        assertTrue(response.ok());
        assertNotNull(response.user());
        assertEquals("department", response.user().role());
    }

    @Test
    void seededUsersContainThreeUsersPerRole() {
        ApiDtos.DashboardResponse snapshot = workflowController.dashboard();
        assertEquals(3, snapshot.users().stream().filter(user -> "STUDENT".equals(user.role())).count());
        assertEquals(3, snapshot.users().stream().filter(user -> "TEACHER".equals(user.role())).count());
        assertEquals(1, snapshot.users().stream().filter(user -> "DEPARTMENT".equals(user.role())).count());
    }

    @Test
    void studentCanSeeReadyApprovedTopicsInCatalog() {
        ApiDtos.DashboardResponse snapshot = workflowVerificationController.state();
        long readyTopicCount = snapshot.topics().stream()
                .filter(topic -> "TEACHER".equals(topic.proposerRole()))
                .filter(topic -> "APPROVED".equals(topic.status()))
                .count();
        assertTrue(readyTopicCount >= 3);
    }

    @Test
    void verificationControllerExposesDbBackedWorkflowState() {
        ApiDtos.DashboardResponse state = workflowVerificationController.state();
        assertNotNull(state);
        assertFalse(state.users().isEmpty());
        assertFalse(state.topics().isEmpty());
        assertFalse(state.plans().isEmpty());
    }

    @Test
    void fullTopicAndPlanApprovalFlowWorks() {
        WorkflowQueryService.DashboardSnapshot initial = workflowQueryService.getDashboard();
        Long studentId = initial.users().stream().filter(user -> user.role() == UserRole.STUDENT).findFirst().orElseThrow().id();
        Long teacherId = initial.users().stream().filter(user -> user.role() == UserRole.TEACHER).findFirst().orElseThrow().id();
        Long departmentId = initial.users().stream().filter(user -> user.role() == UserRole.DEPARTMENT).findFirst().orElseThrow().id();
        Long secondTeacherId = initial.users().stream().filter(user -> user.role() == UserRole.TEACHER).skip(1).findFirst().orElseThrow().id();

        Long availableTopicId = workflowController.createTeacherTopic(
                new WorkflowController.TeacherTopicRequest(
                        teacherId,
                        "Regression Flow Catalog Topic",
                        "Catalog topic for end-to-end approval flow.",
                        "B.SE"
                )
        ).topics().stream()
                .filter(topic -> "Regression Flow Catalog Topic".equals(topic.title()))
                .findFirst()
                .map(topic -> topic.id())
                .orElseThrow();

        workflowController.departmentTopicDecision(
                new WorkflowController.DepartmentTopicDecisionRequest(availableTopicId, departmentId, true, null, "Catalog ready")
        );

        ApiDtos.DashboardResponse afterClaim = workflowController.claimTopic(
                new WorkflowController.TopicClaimRequest(availableTopicId, studentId)
        );
        assertNotNull(afterClaim);

        ApiDtos.DashboardResponse afterTeacherTopicApproval = workflowController.teacherTopicDecision(
                new WorkflowController.DecisionRequest(availableTopicId, teacherId, true, "OK")
        );
        assertNotNull(afterTeacherTopicApproval);

        ApiDtos.DashboardResponse afterDepartmentTopicApproval = workflowController.departmentTopicDecision(
                new WorkflowController.DepartmentTopicDecisionRequest(availableTopicId, departmentId, true, secondTeacherId, "Assigned")
        );
        assertNotNull(afterDepartmentTopicApproval);

        WorkflowController.PlanSaveRequest planSaveRequest = new WorkflowController.PlanSaveRequest(
                studentId,
                availableTopicId,
                java.util.stream.IntStream.rangeClosed(1, 15)
                        .mapToObj(week -> new WorkflowController.WeeklyTaskRequest(
                                week,
                                "Week " + week,
                                "Deliverable " + week,
                                "Focus " + week
                        ))
                        .toList()
        );
        ApiDtos.DashboardResponse afterPlanSave = workflowController.savePlan(planSaveRequest);
        assertNotNull(afterPlanSave);

        Long savedPlanId = afterPlanSave.plans().stream()
                .filter(plan -> plan.studentId().equals(studentId))
                .findFirst()
                .orElseThrow()
                .id();

        ApiDtos.DashboardResponse afterPlanSubmit = workflowController.submitPlan(
                new WorkflowController.PlanSubmitRequest(savedPlanId, studentId)
        );
        assertNotNull(afterPlanSubmit);

        ApiDtos.DashboardResponse afterTeacherPlanApproval = workflowController.teacherPlanDecision(
                new WorkflowController.DecisionRequest(savedPlanId, secondTeacherId, true, "Plan OK")
        );
        assertNotNull(afterTeacherPlanApproval);

        ApiDtos.DashboardResponse afterDepartmentPlanApproval = workflowController.departmentPlanDecision(
                new WorkflowController.DecisionRequest(savedPlanId, departmentId, true, "Final OK")
        );
        assertNotNull(afterDepartmentPlanApproval);

        assertFalse(afterDepartmentPlanApproval.plans().stream()
                .filter(plan -> plan.id().equals(savedPlanId))
                .findFirst()
                .orElseThrow()
                .status()
                .isBlank());
    }

    @Test
    void verificationControllerRunsFullTeacherStudentDepartmentWorkflow() {
        ApiDtos.DashboardResponse initial = workflowVerificationController.state();
        Long studentId = initial.users().stream().filter(user -> "STUDENT".equals(user.role())).findFirst().orElseThrow().id();
        Long teacherId = initial.users().stream().filter(user -> "TEACHER".equals(user.role())).findFirst().orElseThrow().id();
        Long advisorTeacherId = initial.users().stream().filter(user -> "TEACHER".equals(user.role())).skip(1).findFirst().orElseThrow().id();
        Long departmentId = initial.users().stream().filter(user -> "DEPARTMENT".equals(user.role())).findFirst().orElseThrow().id();

        ApiDtos.DashboardResponse teacherTopic = workflowVerificationController.teacherProposesTopic(
                new WorkflowVerificationController.TeacherTopicProposalRequest(
                        teacherId,
                        "Department Approved Catalog Topic",
                        "Teacher proposes a topic that department adds to approved catalog.",
                        "B.SE"
                )
        );
        Long teacherTopicId = teacherTopic.topics().stream()
                .filter(topic -> "Department Approved Catalog Topic".equals(topic.title()))
                .findFirst()
                .orElseThrow()
                .id();
        assertEquals(TopicStatus.PENDING_DEPARTMENT_APPROVAL.name(), teacherTopic.topics().stream()
                .filter(topic -> topic.id().equals(teacherTopicId))
                .findFirst()
                .orElseThrow()
                .status());

        ApiDtos.DashboardResponse departmentCatalogApproval = workflowVerificationController.departmentApprovesTopic(
                new WorkflowVerificationController.TopicDepartmentApprovalRequest(
                        teacherTopicId,
                        departmentId,
                        true,
                        null,
                        "Catalog approved"
                )
        );
        assertEquals(TopicStatus.APPROVED.name(), departmentCatalogApproval.topics().stream()
                .filter(topic -> topic.id().equals(teacherTopicId))
                .findFirst()
                .orElseThrow()
                .status());

        ApiDtos.DashboardResponse studentSelection = workflowVerificationController.studentSelectsApprovedTopic(
                new WorkflowVerificationController.TopicSelectionRequest(teacherTopicId, studentId)
        );
        assertEquals(TopicStatus.PENDING_TEACHER_APPROVAL.name(), studentSelection.topics().stream()
                .filter(topic -> topic.id().equals(teacherTopicId))
                .findFirst()
                .orElseThrow()
                .status());

        ApiDtos.DashboardResponse teacherApproval = workflowVerificationController.teacherApprovesStudentTopic(
                new WorkflowVerificationController.TopicTeacherApprovalRequest(
                        teacherTopicId,
                        null,
                        teacherId,
                        null,
                        "Department Approved Catalog Topic",
                        true,
                        "Teacher approved student selection"
                )
        );
        assertEquals(TopicStatus.PENDING_DEPARTMENT_APPROVAL.name(), teacherApproval.topics().stream()
                .filter(topic -> topic.id().equals(teacherTopicId))
                .findFirst()
                .orElseThrow()
                .status());

        ApiDtos.DashboardResponse departmentFinalApproval = workflowVerificationController.departmentApprovesTopic(
                new WorkflowVerificationController.TopicDepartmentApprovalRequest(
                        teacherTopicId,
                        departmentId,
                        true,
                        advisorTeacherId,
                        "Department assigned advisor"
                )
        );
        assertEquals(TopicStatus.APPROVED.name(), departmentFinalApproval.topics().stream()
                .filter(topic -> topic.id().equals(teacherTopicId))
                .findFirst()
                .orElseThrow()
                .status());

        ApiDtos.DashboardResponse savedPlan = workflowVerificationController.studentCreatesPlan(
                new WorkflowVerificationController.StudentPlanRequest(
                        studentId,
                        teacherTopicId,
                        java.util.stream.IntStream.rangeClosed(1, 15)
                                .mapToObj(week -> new WorkflowVerificationController.WeeklyTaskRequest(
                                        week,
                                        "Week " + week,
                                        "Deliverable " + week,
                                        "Focus " + week
                                ))
                                .toList()
                )
        );
        Long savedPlanId = savedPlan.plans().stream()
                .filter(plan -> plan.studentId().equals(studentId) && plan.topicId().equals(teacherTopicId))
                .findFirst()
                .orElseThrow()
                .id();
        assertEquals(PlanStatus.DRAFT.name(), savedPlan.plans().stream()
                .filter(plan -> plan.id().equals(savedPlanId))
                .findFirst()
                .orElseThrow()
                .status());

        ApiDtos.DashboardResponse submittedPlan = workflowVerificationController.studentSubmitsPlan(
                new WorkflowVerificationController.PlanSubmitRequest(savedPlanId, studentId)
        );
        assertEquals(PlanStatus.PENDING_TEACHER_APPROVAL.name(), submittedPlan.plans().stream()
                .filter(plan -> plan.id().equals(savedPlanId))
                .findFirst()
                .orElseThrow()
                .status());

        ApiDtos.DashboardResponse teacherPlanApproval = workflowVerificationController.teacherApprovesPlan(
                new WorkflowVerificationController.PlanApprovalRequest(savedPlanId, null, advisorTeacherId, null, true, "Teacher plan approval")
        );
        assertEquals(PlanStatus.PENDING_DEPARTMENT_APPROVAL.name(), teacherPlanApproval.plans().stream()
                .filter(plan -> plan.id().equals(savedPlanId))
                .findFirst()
                .orElseThrow()
                .status());

        ApiDtos.DashboardResponse departmentPlanApproval = workflowVerificationController.departmentApprovesPlan(
                new WorkflowVerificationController.PlanApprovalRequest(savedPlanId, null, null, departmentId, true, "Department plan approval")
        );
        assertEquals(PlanStatus.APPROVED.name(), departmentPlanApproval.plans().stream()
                .filter(plan -> plan.id().equals(savedPlanId))
                .findFirst()
                .orElseThrow()
                .status());
    }

    @Test
    void departmentApprovalCanAutoAssignTeacherWhoApprovedTopic() {
        ApiDtos.DashboardResponse initial = workflowVerificationController.state();
        Long studentId = initial.users().stream().filter(user -> "STUDENT".equals(user.role())).findFirst().orElseThrow().id();
        Long teacherId = initial.users().stream().filter(user -> "TEACHER".equals(user.role())).findFirst().orElseThrow().id();
        Long departmentId = initial.users().stream().filter(user -> "DEPARTMENT".equals(user.role())).findFirst().orElseThrow().id();

        ApiDtos.DashboardResponse proposal = workflowVerificationController.studentProposesTopic(
                new WorkflowVerificationController.StudentTopicProposalRequest(
                        studentId,
                        "Auto advisor fallback topic",
                        "Department should infer advisor from teacher approval.",
                        "B.SE"
                )
        );

        Long topicId = proposal.topics().stream()
                .filter(topic -> "Auto advisor fallback topic".equals(topic.title()))
                .findFirst()
                .orElseThrow()
                .id();

        workflowVerificationController.teacherApprovesStudentTopic(
                new WorkflowVerificationController.TopicTeacherApprovalRequest(
                        topicId,
                        null,
                        teacherId,
                        null,
                        "Auto advisor fallback topic",
                        true,
                        "Teacher approved"
                )
        );

        ApiDtos.DashboardResponse approved = workflowVerificationController.departmentApprovesTopic(
                new WorkflowVerificationController.TopicDepartmentApprovalRequest(
                        topicId,
                        departmentId,
                        true,
                        null,
                        "Department approved"
                )
        );

        ApiDtos.TopicDto topic = approved.topics().stream()
                .filter(item -> item.id().equals(topicId))
                .findFirst()
                .orElseThrow();

        assertEquals("APPROVED", topic.status());
        assertEquals(teacherId, topic.advisorTeacherId());
    }

    @Test
    void rejectedCatalogTopicReturnsToAvailableAndStudentCanChooseAnother() {
        ApiDtos.DashboardResponse initial = workflowVerificationController.state();
        Long studentId = initial.users().stream().filter(user -> "STUDENT".equals(user.role())).findFirst().orElseThrow().id();
        Long teacherId = initial.users().stream().filter(user -> "TEACHER".equals(user.role())).findFirst().orElseThrow().id();
        Long departmentId = initial.users().stream().filter(user -> "DEPARTMENT".equals(user.role())).findFirst().orElseThrow().id();

        ApiDtos.DashboardResponse created = workflowVerificationController.teacherProposesTopic(
                new WorkflowVerificationController.TeacherTopicProposalRequest(
                        teacherId,
                        "Retryable catalog topic",
                        "Should return to catalog after rejection.",
                        "B.SE"
                )
        );
        Long topicId = created.topics().stream()
                .filter(topic -> "Retryable catalog topic".equals(topic.title()))
                .findFirst()
                .orElseThrow()
                .id();

        workflowVerificationController.departmentApprovesTopic(
                new WorkflowVerificationController.TopicDepartmentApprovalRequest(topicId, departmentId, true, null, "Catalog ready")
        );
        workflowVerificationController.studentSelectsApprovedTopic(
                new WorkflowVerificationController.TopicSelectionRequest(topicId, studentId)
        );

        ApiDtos.DashboardResponse rejected = workflowVerificationController.teacherApprovesStudentTopic(
                new WorkflowVerificationController.TopicTeacherApprovalRequest(
                        topicId,
                        null,
                        teacherId,
                        null,
                        "Retryable catalog topic",
                        false,
                        "Choose another topic"
                )
        );

        ApiDtos.TopicDto topicAfterRejection = rejected.topics().stream()
                .filter(topic -> topic.id().equals(topicId))
                .findFirst()
                .orElseThrow();
        assertEquals("APPROVED", topicAfterRejection.status());
        assertEquals(null, topicAfterRejection.ownerStudentId());

        ApiDtos.DashboardResponse reclaimed = workflowVerificationController.studentSelectsApprovedTopic(
                new WorkflowVerificationController.TopicSelectionRequest(topicId, studentId)
        );
        assertEquals("PENDING_TEACHER_APPROVAL", reclaimed.topics().stream()
                .filter(topic -> topic.id().equals(topicId))
                .findFirst()
                .orElseThrow()
                .status());
    }

    @Test
    void departmentRejectionCreatesStudentNotification() {
        ApiDtos.DashboardResponse initial = workflowVerificationController.state();
        Long studentId = initial.users().stream().filter(user -> "STUDENT".equals(user.role())).findFirst().orElseThrow().id();
        Long teacherId = initial.users().stream().filter(user -> "TEACHER".equals(user.role())).findFirst().orElseThrow().id();
        Long departmentId = initial.users().stream().filter(user -> "DEPARTMENT".equals(user.role())).findFirst().orElseThrow().id();

        ApiDtos.DashboardResponse proposal = workflowVerificationController.studentProposesTopic(
                new WorkflowVerificationController.StudentTopicProposalRequest(
                        studentId,
                        "Department rejection notification topic",
                        "Student should be notified on department rejection.",
                        "B.SE"
                )
        );

        Long topicId = proposal.topics().stream()
                .filter(topic -> "Department rejection notification topic".equals(topic.title()))
                .findFirst()
                .orElseThrow()
                .id();

        workflowVerificationController.teacherApprovesStudentTopic(
                new WorkflowVerificationController.TopicTeacherApprovalRequest(
                        topicId,
                        null,
                        teacherId,
                        null,
                        "Department rejection notification topic",
                        true,
                        "Teacher approved"
                )
        );

        ApiDtos.DashboardResponse rejected = workflowVerificationController.departmentApprovesTopic(
                new WorkflowVerificationController.TopicDepartmentApprovalRequest(
                        topicId,
                        departmentId,
                        false,
                        null,
                        "Department rejected"
                )
        );

        assertTrue(rejected.notifications().stream()
                .anyMatch(notification -> notification.userId().equals(studentId) && notification.message().contains("буцаалаа")));
    }

    @Test
    void selectedApprovedTopicBecomesStudentsCurrentTopicAfterTeacherAndDepartmentApproval() {
        ApiDtos.DashboardResponse initial = workflowVerificationController.state();
        Long studentId = initial.users().stream().filter(user -> "STUDENT".equals(user.role())).skip(2).findFirst().orElseThrow().id();
        Long teacherId = initial.users().stream().filter(user -> "TEACHER".equals(user.role())).findFirst().orElseThrow().id();
        Long departmentId = initial.users().stream().filter(user -> "DEPARTMENT".equals(user.role())).findFirst().orElseThrow().id();

        Long topicId = initial.topics().stream()
                .filter(topic -> "TEACHER".equals(topic.proposerRole()))
                .filter(topic -> "APPROVED".equals(topic.status()))
                .filter(topic -> topic.ownerStudentId() == null)
                .findFirst()
                .orElseThrow()
                .id();

        workflowVerificationController.studentSelectsApprovedTopic(
                new WorkflowVerificationController.TopicSelectionRequest(topicId, studentId)
        );
        workflowVerificationController.teacherApprovesStudentTopic(
                new WorkflowVerificationController.TopicTeacherApprovalRequest(
                        topicId,
                        null,
                        teacherId,
                        null,
                        null,
                        true,
                        "Teacher approved selected topic"
                )
        );
        ApiDtos.DashboardResponse approved = workflowVerificationController.departmentApprovesTopic(
                new WorkflowVerificationController.TopicDepartmentApprovalRequest(
                        topicId,
                        departmentId,
                        true,
                        null,
                        "Department approved selected topic"
                )
        );

        ApiDtos.TopicDto currentTopic = approved.topics().stream()
                .filter(topic -> topic.id().equals(topicId))
                .findFirst()
                .orElseThrow();

        assertEquals(studentId, currentTopic.ownerStudentId());
        assertEquals("APPROVED", currentTopic.status());
    }

    @Test
    void newlyApprovedTopicSupersedesPreviousApprovedTopicForStudent() {
        ApiDtos.DashboardResponse initial = workflowVerificationController.state();
        Long studentId = initial.users().stream().filter(user -> "STUDENT".equals(user.role())).skip(1).findFirst().orElseThrow().id();
        Long teacherId = initial.users().stream().filter(user -> "TEACHER".equals(user.role())).findFirst().orElseThrow().id();
        Long departmentId = initial.users().stream().filter(user -> "DEPARTMENT".equals(user.role())).findFirst().orElseThrow().id();

        Long previousApprovedTopicId = initial.topics().stream()
                .filter(topic -> studentId.equals(topic.ownerStudentId()))
                .filter(topic -> "APPROVED".equals(topic.status()))
                .findFirst()
                .orElseThrow()
                .id();

        Long replacementTopicId = workflowVerificationController.teacherProposesTopic(
                new WorkflowVerificationController.TeacherTopicProposalRequest(
                        teacherId,
                        "Replacement Topic For Existing Student",
                        "Newly approved topic should replace the old one.",
                        "B.SE"
                )
        ).topics().stream()
                .filter(topic -> "Replacement Topic For Existing Student".equals(topic.title()))
                .findFirst()
                .orElseThrow()
                .id();

        workflowVerificationController.departmentApprovesTopic(
                new WorkflowVerificationController.TopicDepartmentApprovalRequest(
                        replacementTopicId,
                        departmentId,
                        true,
                        null,
                        "Catalog ready"
                )
        );
        workflowVerificationController.studentSelectsApprovedTopic(
                new WorkflowVerificationController.TopicSelectionRequest(replacementTopicId, studentId)
        );
        workflowVerificationController.teacherApprovesStudentTopic(
                new WorkflowVerificationController.TopicTeacherApprovalRequest(
                        replacementTopicId,
                        null,
                        teacherId,
                        null,
                        "Replacement Topic For Existing Student",
                        true,
                        "Teacher approved replacement"
                )
        );

        ApiDtos.DashboardResponse finalState = workflowVerificationController.departmentApprovesTopic(
                new WorkflowVerificationController.TopicDepartmentApprovalRequest(
                        replacementTopicId,
                        departmentId,
                        true,
                        teacherId,
                        "Department approved replacement"
                )
        );

        ApiDtos.TopicDto replacementTopic = finalState.topics().stream()
                .filter(topic -> topic.id().equals(replacementTopicId))
                .findFirst()
                .orElseThrow();
        ApiDtos.TopicDto previousTopic = finalState.topics().stream()
                .filter(topic -> topic.id().equals(previousApprovedTopicId))
                .findFirst()
                .orElseThrow();

        assertEquals(studentId, replacementTopic.ownerStudentId());
        assertEquals("APPROVED", replacementTopic.status());
        assertEquals("SUPERSEDED", previousTopic.status());
        assertEquals(1, finalState.topics().stream()
                .filter(topic -> studentId.equals(topic.ownerStudentId()))
                .filter(topic -> "APPROVED".equals(topic.status()))
                .count());
    }

    @Test
    void savePlanFallsBackToLatestApprovedTopicWhenClientSendsStaleTopicId() {
        ApiDtos.DashboardResponse initial = workflowVerificationController.state();
        Long studentId = initial.users().stream().filter(user -> "STUDENT".equals(user.role())).skip(1).findFirst().orElseThrow().id();
        Long teacherId = initial.users().stream().filter(user -> "TEACHER".equals(user.role())).findFirst().orElseThrow().id();
        Long departmentId = initial.users().stream().filter(user -> "DEPARTMENT".equals(user.role())).findFirst().orElseThrow().id();

        Long oldApprovedTopicId = initial.topics().stream()
                .filter(topic -> studentId.equals(topic.ownerStudentId()))
                .filter(topic -> "APPROVED".equals(topic.status()))
                .findFirst()
                .orElseThrow()
                .id();

        Long newTopicId = workflowVerificationController.teacherProposesTopic(
                new WorkflowVerificationController.TeacherTopicProposalRequest(
                        teacherId,
                        "Plan fallback approved topic",
                        "Used to verify plan save fallback.",
                        "B.SE"
                )
        ).topics().stream()
                .filter(topic -> "Plan fallback approved topic".equals(topic.title()))
                .findFirst()
                .orElseThrow()
                .id();

        workflowVerificationController.departmentApprovesTopic(
                new WorkflowVerificationController.TopicDepartmentApprovalRequest(newTopicId, departmentId, true, null, "Catalog ready")
        );
        workflowVerificationController.studentSelectsApprovedTopic(
                new WorkflowVerificationController.TopicSelectionRequest(newTopicId, studentId)
        );
        workflowVerificationController.teacherApprovesStudentTopic(
                new WorkflowVerificationController.TopicTeacherApprovalRequest(
                        newTopicId,
                        null,
                        teacherId,
                        null,
                        "Plan fallback approved topic",
                        true,
                        "Teacher approved"
                )
        );
        workflowVerificationController.departmentApprovesTopic(
                new WorkflowVerificationController.TopicDepartmentApprovalRequest(newTopicId, departmentId, true, teacherId, "Department approved")
        );

        ApiDtos.DashboardResponse savedPlan = workflowVerificationController.studentCreatesPlan(
                new WorkflowVerificationController.StudentPlanRequest(
                        studentId,
                        oldApprovedTopicId,
                        java.util.stream.IntStream.rangeClosed(1, 15)
                                .mapToObj(week -> new WorkflowVerificationController.WeeklyTaskRequest(
                                        week,
                                        "Week " + week,
                                        "Deliverable " + week,
                                        "Focus " + week
                                ))
                                .toList()
                )
        );

        ApiDtos.PlanDto currentPlan = savedPlan.plans().stream()
                .filter(plan -> plan.studentId().equals(studentId))
                .filter(plan -> plan.topicId().equals(newTopicId))
                .findFirst()
                .orElseThrow();

        assertEquals("Plan fallback approved topic", currentPlan.topicTitle());
    }

    @Test
    void onlyAdvisorTeacherCanApprovePlan() {
        ApiDtos.DashboardResponse initial = workflowVerificationController.state();
        Long studentId = initial.users().stream().filter(user -> "STUDENT".equals(user.role())).findFirst().orElseThrow().id();
        Long teacherId = initial.users().stream().filter(user -> "TEACHER".equals(user.role())).findFirst().orElseThrow().id();
        Long nonAdvisorTeacherId = initial.users().stream().filter(user -> "TEACHER".equals(user.role())).skip(1).findFirst().orElseThrow().id();
        Long departmentId = initial.users().stream().filter(user -> "DEPARTMENT".equals(user.role())).findFirst().orElseThrow().id();

        Long topicId = workflowVerificationController.teacherProposesTopic(
                new WorkflowVerificationController.TeacherTopicProposalRequest(
                        teacherId,
                        "Advisor only plan approval topic",
                        "Plan should be approved only by advisor.",
                        "B.SE"
                )
        ).topics().stream()
                .filter(topic -> "Advisor only plan approval topic".equals(topic.title()))
                .findFirst()
                .orElseThrow()
                .id();

        workflowVerificationController.departmentApprovesTopic(
                new WorkflowVerificationController.TopicDepartmentApprovalRequest(topicId, departmentId, true, null, "Catalog ready")
        );
        workflowVerificationController.studentSelectsApprovedTopic(
                new WorkflowVerificationController.TopicSelectionRequest(topicId, studentId)
        );
        workflowVerificationController.teacherApprovesStudentTopic(
                new WorkflowVerificationController.TopicTeacherApprovalRequest(topicId, null, teacherId, null, null, true, "Teacher approved")
        );
        workflowVerificationController.departmentApprovesTopic(
                new WorkflowVerificationController.TopicDepartmentApprovalRequest(topicId, departmentId, true, teacherId, "Advisor assigned")
        );

        Long planId = workflowVerificationController.studentCreatesPlan(
                new WorkflowVerificationController.StudentPlanRequest(
                        studentId,
                        topicId,
                        java.util.stream.IntStream.rangeClosed(1, 15)
                                .mapToObj(week -> new WorkflowVerificationController.WeeklyTaskRequest(week, "Week " + week, "Deliverable " + week, "Focus " + week))
                                .toList()
                )
        ).plans().stream()
                .filter(plan -> plan.studentId().equals(studentId) && plan.topicId().equals(topicId))
                .findFirst()
                .orElseThrow()
                .id();

        workflowVerificationController.studentSubmitsPlan(
                new WorkflowVerificationController.PlanSubmitRequest(planId, studentId)
        );

        assertThrows(IllegalStateException.class, () ->
                workflowVerificationController.teacherApprovesPlan(
                        new WorkflowVerificationController.PlanApprovalRequest(planId, null, nonAdvisorTeacherId, null, true, "Not advisor")
                )
        );
    }
}
