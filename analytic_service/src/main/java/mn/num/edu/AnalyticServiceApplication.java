package mn.num.edu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"mn.num.edu"})
public class AnalyticServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnalyticServiceApplication.class, args);
    }
}
