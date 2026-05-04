package mn.num.edu.thesis_service.domain.exception;

public class InvalidThesisStateException extends RuntimeException {
    public InvalidThesisStateException(String message) {
        super(message);
    }
}