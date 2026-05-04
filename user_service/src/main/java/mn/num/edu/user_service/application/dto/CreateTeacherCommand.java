package mn.num.edu.user_service.application.dto;

import mn.num.edu.user_service.domain.model.SystemRole;

public record CreateTeacherCommand(

        String firstName,
        String lastName,
        String email,
        String departmentId,
        String position

) {


}