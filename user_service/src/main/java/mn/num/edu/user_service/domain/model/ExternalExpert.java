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
@Table("external_experts")
public class ExternalExpert implements Persistable<String> {

    @Id
    private String id;

    private String userId;
    private String organization;
    private String expertise;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    public static ExternalExpert create(String userId, String organization, String expertise) {
        return ExternalExpert.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .organization(organization)
                .expertise(expertise)
                .isNew(true)
                .build();
    }

    @Override
    public boolean isNew() {
        return isNew;
    }
}
