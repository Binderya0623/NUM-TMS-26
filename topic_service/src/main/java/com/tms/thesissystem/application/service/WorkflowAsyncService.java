package com.tms.thesissystem.application.service;

import com.tms.thesissystem.api.ApiDtos;
import com.tms.thesissystem.api.ApiResponseMapper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class WorkflowAsyncService {
    private final WorkflowQueryService queryService;
    private final ApiResponseMapper apiResponseMapper;

    public WorkflowAsyncService(WorkflowQueryService queryService, ApiResponseMapper apiResponseMapper) {
        this.queryService = queryService;
        this.apiResponseMapper = apiResponseMapper;
    }

    @Async
    public CompletableFuture<ApiDtos.DashboardResponse> dashboardAsync() {
        return CompletableFuture.completedFuture(apiResponseMapper.toDashboardResponse(queryService.getDashboard()));
    }
}
