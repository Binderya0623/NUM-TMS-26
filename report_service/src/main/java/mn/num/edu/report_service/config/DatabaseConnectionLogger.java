package mn.num.edu.report_service.config;

import io.r2dbc.spi.ConnectionFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class DatabaseConnectionLogger implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConnectionLogger.class);

    private final ConnectionFactory connectionFactory;

    public DatabaseConnectionLogger(ConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @Override
    public void run(String... args) {
        Mono.from(connectionFactory.create())
                .flatMap(connection -> {
                    log.info("✅ PostgreSQL DB-тэй амжилттай холбогдлоо.");
                    return Mono.from(connection.close());
                })
                .doOnError(error ->
                        log.error("❌ PostgreSQL DB-тэй холбогдож чадсангүй: {}", error.getMessage(), error)
                )
                .subscribe();
    }
}
