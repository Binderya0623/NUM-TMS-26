package mn.num.edu.committee_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories;

@EnableR2dbcRepositories(basePackages = "mn.num.edu.committee_service.adapter.out.persistence")

@SpringBootApplication
public class CommitteeServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CommitteeServiceApplication.class, args);
	}

}
