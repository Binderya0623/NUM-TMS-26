package mn.num.edu.committee_service.domain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("committees")
public class Committee implements Persistable<String> {

    @Id
    @Column("id")
    private final String id;

    @Getter
    @Column("name")
    private final String name;

    @Getter
    @Column("department_id")
    private final String departmentId;

    @Getter
    @JsonProperty("stageType")
    @Column("defense_type")
    private final String defenseType;

    @Getter
    @Column("status")
    private final String status;

    @Getter
    @Column("created_at")
    private final LocalDateTime createdAt;

    @Transient
    private boolean isNew;

    public Committee(
            String id,
            String name,
            String departmentId,
            String defenseType,
            String status,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.name = name;
        this.departmentId = departmentId;
        this.defenseType = defenseType;
        this.status = status;
        this.createdAt = createdAt;
        this.isNew = false;
    }

    public static Committee create(String departmentId, String name, String defenseType) {
        Committee committee = new Committee(
                UUID.randomUUID().toString(),
                name,
                departmentId,
                defenseType,
                "ACTIVE",
                LocalDateTime.now()
        );
        committee.isNew = true;
        return committee;
    }

    public Committee markPersisted() {
        this.isNew = false;
        return this;
    }

    public Committee withStatus(String newStatus) {
        Committee updated = new Committee(this.id, this.name, this.departmentId, this.defenseType, newStatus, this.createdAt);
        updated.isNew = false;
        return updated;
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