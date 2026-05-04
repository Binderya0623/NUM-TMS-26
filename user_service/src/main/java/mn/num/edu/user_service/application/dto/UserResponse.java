package mn.num.edu.user_service.application.dto;
import lombok.*;
import mn.num.edu.user_service.domain.model.SystemRole;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.util.List;

@Value
public class UserResponse {
    Long id;
    String firstName;
    String lastName;
    String email;
    SystemRole role;

}