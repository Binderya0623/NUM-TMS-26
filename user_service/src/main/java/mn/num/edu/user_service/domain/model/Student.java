package mn.num.edu.user_service.domain.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("students")
public class Student implements Persistable<String> {

    @Id
    private String id;

    private String userId;
    private String studentId;

    private String major;

    @Transient
    private boolean isNew = true;

    public static Student create(
            String userId,
            String studentId,
            String major
    ) {
        return Student.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .studentId(studentId)
                .major(major)
                .isNew(true)
                .build();
    }

    @Override
    public boolean isNew() {
        return isNew;
    }
}