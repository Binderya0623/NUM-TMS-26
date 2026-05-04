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
@Table("users")
public class User implements Persistable<String> {

    @Id
    private String id;

    @Column("first_name")
    private String firstName;

    @Column("last_name")
    private String lastName;

    private String email;
    private String departmentId;
    @Column("system_role")
    private SystemRole systemRole;

    private boolean active;

    @Column("created_at")
    private Instant createdAt;

    @Transient
    private boolean isNew;

    public static User create(String firstName, String lastName, String email, SystemRole systemRole, String departmentId) {
        return new User(
                UUID.randomUUID().toString(),
                firstName,
                lastName,
                email,
                departmentId,
                systemRole,
                true,
                Instant.now(),
                true
        );
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }
}

