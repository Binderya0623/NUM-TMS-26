package mn.num.edu.user_service.adapter.out.auth;

import mn.num.edu.user_service.application.port.out.AuthServicePort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Component
public class WebClientAuthServiceAdapter implements AuthServicePort {

    private static final Logger log = LoggerFactory.getLogger(WebClientAuthServiceAdapter.class);

    private final WebClient webClient;
    private final String authBaseUrl;

    public WebClientAuthServiceAdapter(@Value("${app.auth.url:http://localhost:8887}") String authBaseUrl) {
        // Avoid WebClient.baseUrl() — Java's URI parser rejects underscores in hostnames
        // (e.g. "auth_service"), which causes "Host is not specified" at request time.
        // Building the full URI per-request sidesteps that restriction.
        this.webClient = WebClient.builder().build();
        this.authBaseUrl = authBaseUrl;
    }

    @Override
    public Mono<Void> registerCredentials(String sisiId, String password, String role) {
        Map<String, Object> body = Map.of(
                "sisiId", sisiId,
                "password", password,
                "roles", List.of(role)
        );
        return webClient.post()
                .uri(authBaseUrl + "/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .toBodilessEntity()
                .doOnSuccess(r -> log.info("auth-service /auth/register OK. sisiId={}, status={}", sisiId, r.getStatusCode()))
                .doOnError(e -> log.error("auth-service /auth/register failed. sisiId={}, err={}", sisiId, e.toString()))
                .then();
    }
}
