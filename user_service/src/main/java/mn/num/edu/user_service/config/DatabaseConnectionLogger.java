package mn.num.edu.user_service.config;


import io.r2dbc.spi.ConnectionFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseConnectionLogger implements CommandLineRunner {

    private final ConnectionFactory connectionFactory;

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