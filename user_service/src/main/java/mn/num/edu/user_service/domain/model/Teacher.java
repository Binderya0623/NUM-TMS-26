package mn.num.edu.user_service.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("teachers")
public class Teacher implements Persistable<String> {

    @Id
    private String id;

    private String userId;
    private String position;

    @Transient
    private boolean isNew = true;

    public static Teacher create(
            String userId,
            String position
    ) {
        return Teacher.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .position(position)
                .isNew(true)
                .build();
    }

    @Override
    public boolean isNew() {
        return isNew;
    }
}