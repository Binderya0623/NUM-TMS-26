package com.tms.thesissystem.application.port;

import com.tms.thesissystem.application.event.WorkflowEvent;

public interface WorkflowEventPublisher {
    void publish(WorkflowEvent event);
}
