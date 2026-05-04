package com.example.user_detail_register.filter;

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
import java.util.Enumeration;
import java.util.List;

@Slf4j
public class GatewayHeadersAuthenticationFilter extends OncePerRequestFilter {

   private static final String USER_ID_HEADER = "X-User-ID";
   private static final String USER_ROLES_HEADER = "X-User-Roles";

   @Override
   protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
           throws ServletException, IOException {

       log.info("==== DEBUG: Request to {} ====", request.getRequestURI());
       Enumeration<String> headerNames = request.getHeaderNames();
       while (headerNames.hasMoreElements()) {
           String headerName = headerNames.nextElement();
           log.info("Header: {} = {}", headerName, request.getHeader(headerName));
       }
       log.info("==== END DEBUG ====");

       String userId = request.getHeader(USER_ID_HEADER);
       String rolesHeader = request.getHeader(USER_ROLES_HEADER);

       log.info("X-User-ID: {}, X-User-Roles: {}", userId, rolesHeader);

       if (userId != null && !userId.isEmpty() && rolesHeader != null && !rolesHeader.isEmpty()) {
           log.info("Gateway-с ирсэн header: ID={}, Roles={}", userId, rolesHeader);

           List<GrantedAuthority> authorities = new ArrayList<>();
           String[] roles = rolesHeader.split(",");
           for (String role : roles) {
               if (!role.trim().isEmpty()) {
                   String authority = role.trim();
                   log.info("Нэмж буй эрх: {}", authority);
                   authorities.add(new SimpleGrantedAuthority(authority));
               }
           }

           if (!authorities.isEmpty()) {
               UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                       userId,
                       null,
                       authorities);

               SecurityContextHolder.getContext().setAuthentication(authentication);
               log.info("SecurityContext-д Authentication хийлээ: {}", authentication);
           } else {
               log.warn("Gateway-с ирсэн ролууд хоосон байна: {}", rolesHeader);
               SecurityContextHolder.clearContext();
           }
       } else {
            log.info("Gateway-н header-үүд олдсонгүй: userId={}, roles={}", userId, rolesHeader);
            SecurityContextHolder.clearContext();
       }

       filterChain.doFilter(request, response);
   }
}
