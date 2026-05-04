package com.tms.thesissystem.infrastructure.events;

import com.tms.thesissystem.application.event.WorkflowEvent;
import com.tms.thesissystem.application.port.WorkflowRepository;
import com.tms.thesissystem.domain.model.AuditEntry;
import com.tms.thesissystem.domain.model.Notification;
import org.springframework.stereotype.Service;

@Service
public class WorkflowEventProjectionService {
    private final WorkflowRepository repository;

    public WorkflowEventProjectionService(WorkflowRepository repository) {
        this.repository = repository;
    }

    public void storeNotifications(WorkflowEvent event) {
        for (Long recipientId : event.recipientIds()) {
            repository.saveNotification(new Notification(repository.nextNotificationId(), recipientId,
                    event.notificationTitle(), event.notificationMessage(), event.occurredAt()));
        }
    }

    public void storeAuditEntry(WorkflowEvent event) {
        repository.saveAuditEntry(new AuditEntry(repository.nextAuditId(), event.entityType(), event.entityId(),
                event.action(), event.actorName(), event.detail(), event.occurredAt()));
    }
}
