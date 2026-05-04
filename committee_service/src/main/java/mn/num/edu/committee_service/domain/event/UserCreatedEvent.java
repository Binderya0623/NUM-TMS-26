package mn.num.edu.committee_service.domain.event;

import java.time.Instant;

public class UserCreatedEvent {
    private String eventId;
    private String eventType;
    private Instant occurredAt;
    private String producer;
    private Payload payload;

    public UserCreatedEvent() {
    }

    public UserCreatedEvent(String eventId, String eventType, Instant occurredAt, String producer, Payload payload) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.occurredAt = occurredAt;
        this.producer = producer;
        this.payload = payload;
    }

    public String getEventId() {
        return eventId;
    }

    public String getEventType() {
        return eventType;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }

    public String getProducer() {
        return producer;
    }

    public Payload getPayload() {
        return payload;
    }

    public static class Payload {
        private String userId;
        private String firstName;
        private String lastName;
        private String email;
        private String systemRole;
        private String departmentId;
        private boolean active;
        private Instant createdAt;

        public Payload() {
        }

        public Payload(
                String userId,
                String firstName,
                String lastName,
                String email,
                String systemRole,
                String departmentId,
                boolean active,
                Instant createdAt
        ) {
            this.userId = userId;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.systemRole = systemRole;
            this.departmentId = departmentId;
            this.active = active;
            this.createdAt = createdAt;
        }

        public String getUserId() {
            return userId;
        }

        public String getFirstName() {
            return firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public String getEmail() {
            return email;
        }

        public String getSystemRole() {
            return systemRole;
        }

        public String getDepartmentId() {
            return departmentId;
        }

        public boolean isActive() {
            return active;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }
    }
}