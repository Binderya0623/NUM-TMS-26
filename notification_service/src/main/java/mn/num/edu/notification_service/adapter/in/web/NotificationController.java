package mn.num.edu.notification_service.adapter.in.web;

import mn.num.edu.notification_service.application.port.out.LoadNotificationPort;
import mn.num.edu.notification_service.domain.model.Notification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import reactor.core.publisher.Mono;

@Tag(name = "Notification API", description = "Notification endpoints")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final LoadNotificationPort loadNotificationPort;

    public NotificationController(LoadNotificationPort loadNotificationPort) {
        this.loadNotificationPort = loadNotificationPort;
    }

    @Operation(summary = "Get notifications by userId")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Notifications retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "No notifications found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/user/{userId}")
    public Mono<ResponseEntity<Flux<Notification>>> getByUserId(@PathVariable UUID userId) {

        Flux<Notification> notifications = loadNotificationPort.findByUserId(userId);

        return Mono.just(ResponseEntity.ok(notifications));
    }
}
