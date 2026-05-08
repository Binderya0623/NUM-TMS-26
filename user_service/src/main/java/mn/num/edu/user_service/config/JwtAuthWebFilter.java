package mn.num.edu.user_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.List;
import java.util.Set;

/**
 * Validates the HS256 JWT minted by auth-service. Disabled by default so
 * existing clients keep working — flip app.security.jwt.enabled=true
 * to enforce in production. Always-public paths: /actuator/**, OPTIONS.
 */
@Component
@ConditionalOnProperty(name = "app.security.jwt.enabled", havingValue = "true")
public class JwtAuthWebFilter implements WebFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthWebFilter.class);
    private static final String BEARER = "Bearer ";
    private static final Set<String> PUBLIC_PREFIXES =
            Set.of("/actuator/", "/swagger", "/v3/api-docs", "/auth/");

    @Value("${app.jwt.secret}")
    private String secret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        if (request.getMethod() != null && "OPTIONS".equalsIgnoreCase(request.getMethod().name())) {
            return chain.filter(exchange);
        }
        for (String p : PUBLIC_PREFIXES) {
            if (path.startsWith(p)) return chain.filter(exchange);
        }

        String header = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER)) {
            return reject(exchange, "missing or malformed Authorization header");
        }
        String token = header.substring(BEARER.length()).trim();
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            ServerWebExchange mutated = exchange.mutate()
                    .request(request.mutate()
                            .header("X-Auth-User", String.valueOf(claims.getSubject()))
                            .header("X-Auth-Roles", String.join(",", rolesOf(claims)))
                            .build())
                    .build();
            return chain.filter(mutated);
        } catch (JwtException | IllegalArgumentException e) {
            return reject(exchange, "invalid JWT: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private static List<String> rolesOf(Claims claims) {
        Object roles = claims.get("roles");
        if (roles instanceof List<?>) return (List<String>) roles;
        return List.of();
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    private Mono<Void> reject(ServerWebExchange exchange, String reason) {
        log.debug("rejecting request: {}", reason);
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
}
