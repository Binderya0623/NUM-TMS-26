package mn.num.edu.user_service.application.dto;

import mn.num.edu.user_service.domain.model.SystemRole;

public record CreateStudentCommand(

        String firstName,
        String lastName,
        String email,
        String studentId,
        String departmentId,
        String major

) {


}