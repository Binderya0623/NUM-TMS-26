package com.tms.thesissystem.api;

import com.tms.thesissystem.application.service.DatabaseStatusService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
public class SystemController {
    private final DatabaseStatusService databaseStatusService;

    public SystemController(DatabaseStatusService databaseStatusService) {
        this.databaseStatusService = databaseStatusService;
    }

    @GetMapping("/database")
    public DatabaseStatusService.DatabaseStatus databaseStatus() {
        return databaseStatusService.check();
    }
}
