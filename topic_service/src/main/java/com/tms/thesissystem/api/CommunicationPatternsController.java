package com.tms.thesissystem.api;

import com.tms.thesissystem.application.service.WorkflowAsyncService;
import com.tms.thesissystem.application.service.WorkflowQueryService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/communication")
public class CommunicationPatternsController {
    private final WorkflowQueryService queryService;
    private final WorkflowAsyncService workflowAsyncService;
    private final ApiResponseMapper apiResponseMapper;
    private final boolean rabbitEnabled;

    public CommunicationPatternsController(WorkflowQueryService queryService,
                                           WorkflowAsyncService workflowAsyncService,
                                           ApiResponseMapper apiResponseMapper,
                                           @Value("${app.messaging.rabbit.enabled:false}") boolean rabbitEnabled) {
        this.queryService = queryService;
        this.workflowAsyncService = workflowAsyncService;
        this.apiResponseMapper = apiResponseMapper;
        this.rabbitEnabled = rabbitEnabled;
    }

    @GetMapping("/patterns")
    public PatternsResponse patterns() {
        return new PatternsResponse(
                List.of(
                        new PatternDescription("request-response", "sync", "REST controller synchronous request-response via HTTP"),
                        new PatternDescription("publish-subscribe", rabbitEnabled ? "rabbitmq-fanout" : "local-event-bus", "Workflow event is fanned out to multiple subscribers"),
                        new PatternDescription("message-queue", rabbitEnabled ? "rabbitmq" : "disabled", "RabbitMQ queues for notification and audit consumers"),
                        new PatternDescription("async", "completable-future", "Asynchronous dashboard endpoint backed by @Async")
                )
        );
    }

    @GetMapping("/dashboard-sync")
    public ApiDtos.DashboardResponse dashboardSync() {
        return apiResponseMapper.toDashboardResponse(queryService.getDashboard());
    }

    @GetMapping("/dashboard-async")
    public CompletableFuture<ApiDtos.DashboardResponse> dashboardAsync() {
        return workflowAsyncService.dashboardAsync();
    }

    public record PatternsResponse(List<PatternDescription> patterns) {
    }

    public record PatternDescription(String name, String mode, String description) {
    }
}
