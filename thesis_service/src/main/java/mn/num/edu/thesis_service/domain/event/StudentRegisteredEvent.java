package mn.num.edu.thesis_service.domain.event;

import java.util.UUID;

public class StudentRegisteredEvent {

    private String eventId;
    private String eventType;
    private Payload payload;

    public StudentRegisteredEvent() {
    }

    public StudentRegisteredEvent(String eventId, String eventType, Payload payload) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.payload = payload;
    }

    public String getEventId() {
        return eventId;
    }

    public String getEventType() {
        return eventType;
    }

    public Payload getPayload() {
        return payload;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public void setPayload(Payload payload) {
        this.payload = payload;
    }

    public static class Payload {
        private String userId;
        private String departmentId;
        private String systemRole;
        private boolean active;

        public Payload() {
        }

        public Payload(String userId, String departmentId, String systemRole, boolean active) {
            this.userId = userId;
            this.departmentId = departmentId;
            this.systemRole = systemRole;
            this.active = active;
        }

        public String getUserId() {
            return userId;
        }

        public String getDepartmentId() {
            return departmentId;
        }

        public String getSystemRole() {
            return systemRole;
        }

        public boolean isActive() {
            return active;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public void setDepartmentId(String departmentId) {
            this.departmentId = departmentId;
        }

        public void setSystemRole(String systemRole) {
            this.systemRole = systemRole;
        }

        public void setActive(boolean active) {
            this.active = active;
        }
    }
}