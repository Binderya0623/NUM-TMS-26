package com.example.authorizationservice.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
public class GatewayHeadersAuthenticationFilter extends OncePerRequestFilter {

    private static final String USER_ID_HEADER = "X-User-ID";
    private static final String USER_ROLES_HEADER = "X-User-Roles";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String userId = request.getHeader(USER_ID_HEADER);
        String rolesHeader = request.getHeader(USER_ROLES_HEADER);

        if (userId != null && !userId.isEmpty() && rolesHeader != null && !rolesHeader.isEmpty()) {
            log.debug("Gateway-с ирсэн header: ID={}, Roles={}", userId, rolesHeader);

            List<GrantedAuthority> authorities = new ArrayList<>();
            String[] roles = rolesHeader.split(",");
            for (String role : roles) {
                if (!role.trim().isEmpty()) {
                    // Spring Security hasRole() нь 'ROLE_' prefix-г автоматаар шалгадаггүй тул
                    // эсвэл hasAuthority('ROLE_ADMIN') гэж бичих, эсвэл энд prefix-гүй нэмэх хэрэгтэй.
                    // Одоогийн @PreAuthorize("hasRole('ROLE_ADMIN')")-д тааруулахын тулд prefix-тэй үлдээе.
                    authorities.add(new SimpleGrantedAuthority(role.trim()));
                }
            }

            if (!authorities.isEmpty()) {
                // UsernamePasswordAuthenticationToken нь энгийн сонголт, custom Authentication үүсгэж болно.
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userId, // principal нь userId
                        null,   // credentials шаардлагагүй
                        authorities); // roles/authorities

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("SecurityContext-д Authentication хийлээ: {}", authentication);
            } else {
                log.warn("Gateway-с ирсэн ролууд хоосон байна: {}", rolesHeader);
                SecurityContextHolder.clearContext();
            }
        } else {
             log.trace("Gateway-н header-үүд олдсонгүй.");
             // Header байхгүй бол SecurityContext-г цэвэрлэх нь зөв байж магадгүй
             // SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}