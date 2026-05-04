package mn.num.edu.user_service.domain.model;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("departments")
public class Department implements Persistable<String> {
    @Id
    private String id;

    private String userId;
    private String departmentName;

    @Transient
    private boolean isNew = true;

    public static Department create(
            String userId,
            String departmentName
    ) {
        return Department.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .departmentName(departmentName)
                .isNew(true)
                .build();
    }

    @Override
    public boolean isNew() {
        return isNew;
    }
}
