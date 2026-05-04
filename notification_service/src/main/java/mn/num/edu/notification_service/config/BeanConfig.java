package mn.num.edu.notification_service.config;

import mn.num.edu.notification_service.application.port.out.SaveNotificationPort;
import mn.num.edu.notification_service.application.port.out.PublishNotificationEventPort;
import mn.num.edu.notification_service.application.port.out.LoadNotificationPort;

import mn.num.edu.notification_service.application.service.NotificationApplicationService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BeanConfig {

    @Bean
    public NotificationApplicationService notificationApplicationService(
            SaveNotificationPort saveNotificationPort,
            PublishNotificationEventPort publishNotificationEventPort
    ) {
        return new NotificationApplicationService(saveNotificationPort, publishNotificationEventPort);
    }
}