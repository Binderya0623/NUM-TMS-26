package mn.num.edu.thesis_service.domain.exception;


public class ThesisNotFoundException extends RuntimeException {
    public ThesisNotFoundException(String message) {
        super(message);
    }
}