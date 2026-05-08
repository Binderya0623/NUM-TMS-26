package mn.num.edu.notification_service.domain.model;

public enum NotificationType {
    // Lifecycle / approvals
    THESIS_APPROVED,
    COMMITTEE_ASSIGNED,
    FEEDBACK_ADDED,
    REVIEWER_ASSIGNED,

    // Report flow
    REPORT_SUBMITTED,
    REPORT_ACCEPTED,
    REVISION_REQUIRED,
    REVIEW_DOCUMENT_REQUIRED,
    REVIEW_DOCUMENT_UPLOADED,

    // Sessions
    EXECUTION_SESSION_OPENED,
    EXECUTION_SESSION_CLOSED,
    DEFENSE_SESSION_OPENED,
    DEFENSE_SESSION_CLOSED,
    WORKFLOW_DEADLINE_SET,

    // Grading
    EVALUATION_COMPLETED,
    GRADE_SUBMITTED,
    ALL_GRADES_READY,
    SECRETARY_SUBMITTED_AVERAGE,
    FINAL_GRADE_CALCULATED,
    FINAL_GRADE_CONFIRMED,
    FINAL_GRADE_PUBLISHED,

    // Chat
    NEW_CHAT_MESSAGE,

    // Generic catch-all so callers can pass arbitrary subtypes via the
    // referenceType field rather than expanding this enum forever.
    GENERIC
}
