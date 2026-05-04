package mn.num.edu.workflow_service.domain.exception;

public class WorkflowValidationException  extends RuntimeException {
    public WorkflowValidationException (String message) {
        super(message);
    }
}