package mn.num.edu.workflow_service.domain.exception;

public class WorkflowNotFoundException extends RuntimeException {
    public WorkflowNotFoundException(String message) {
        super(message);
    }
}