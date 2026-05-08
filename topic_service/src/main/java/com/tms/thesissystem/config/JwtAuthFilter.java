package com.tms.thesissystem.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Validates the HS256 JWT minted by auth-service. Disabled by default —
 * flip app.security.jwt.enabled=true in production.
 */
@Component
@ConditionalOnProperty(name = "app.security.jwt.enabled", havingValue = "true")
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);
    private static final String BEARER = "Bearer ";
    private static final Set<String> PUBLIC_PREFIXES =
            Set.of("/actuator/", "/swagger", "/v3/api-docs", "/auth/");

    @Value("${app.jwt.secret}")
    private String secret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }
        String path = request.getRequestURI();
        for (String p : PUBLIC_PREFIXES) {
            if (path.startsWith(p)) { chain.doFilter(request, response); return; }
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        String token = header.substring(BEARER.length()).trim();
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            Map<String, String> extra = new HashMap<>();
            extra.put("X-Auth-User", String.valueOf(claims.getSubject()));
            extra.put("X-Auth-Roles", String.join(",", rolesOf(claims)));
            chain.doFilter(new HeaderInjectingRequest(request, extra), response);
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("invalid JWT: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
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

    private static class HeaderInjectingRequest extends HttpServletRequestWrapper {
        private final Map<String, String> extras;
        HeaderInjectingRequest(HttpServletRequest r, Map<String, String> extras) { super(r); this.extras = extras; }
        @Override public String getHeader(String name) {
            return extras.getOrDefault(name, super.getHeader(name));
        }
        @Override public Enumeration<String> getHeaderNames() {
            java.util.Set<String> all = new java.util.LinkedHashSet<>(Collections.list(super.getHeaderNames()));
            all.addAll(extras.keySet());
            return Collections.enumeration(all);
        }
    }
}
