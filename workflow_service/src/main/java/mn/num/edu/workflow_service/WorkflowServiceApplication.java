package mn.num.edu.workflow_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling

@SpringBootApplication
public class WorkflowServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkflowServiceApplication.class, args);
    }

}
