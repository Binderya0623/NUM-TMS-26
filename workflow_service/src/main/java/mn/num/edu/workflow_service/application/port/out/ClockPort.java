package mn.num.edu.workflow_service.application.port.out;

import java.time.LocalDate;

public interface ClockPort {
    LocalDate today();
}