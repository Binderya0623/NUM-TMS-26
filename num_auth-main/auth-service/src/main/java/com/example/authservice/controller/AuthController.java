package com.example.authservice.controller;

import com.example.authservice.dto.AuthRequest;
import com.example.authservice.dto.AuthResponse;
import com.example.authservice.dto.RegisterRequest;
import com.example.authservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import com.example.authservice.dto.UserRoleUpdateRequest;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.example.authservice.dto.UserResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;
import java.util.Map;
import java.util.HashMap;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody @Valid RegisterRequest request
    ) {
        log.info("Хэрэглэгч бүртгэх хүсэлт: {}", request.getSisiId());
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody @Valid AuthRequest request
    ) {
        log.info("Хэрэглэгч нэвтрэх хүсэлт: {}", request.getSisiId());
        try {
            log.info("ResponseEntity.ok(userService.login(request));: {}", userService.login(request));
            return ResponseEntity.ok(userService.login(request));
        } catch (Exception e) {
            log.error("Нэвтрэх үед алдаа гарлаа - sisiId: {}", request.getSisiId(), e);
            throw new RuntimeException("Хэрэглэгчийн нэр эсвэл нууц үг буруу байна", e);
        }
    }

    // role role role role role role role role role role 
    // role role role role role role role role role role 
    // role role role role role role role role role role 
    @PutMapping("/add-role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AuthResponse> addUserRole(
            @RequestParam String sisiId, 
            @RequestParam String role
    ) {
        log.info("Хэрэглэгчид {} роль нэмэх хүсэлт: {}", role, sisiId);
        return ResponseEntity.ok(userService.addUserRole(sisiId, role));
    }

    @PutMapping("/remove-role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AuthResponse> removeUserRole(
            @RequestParam String sisiId, 
            @RequestParam String role
    ) {
        log.info("Хэрэглэгчээс {} роль хасах хүсэлт: {}", role, sisiId);
        return ResponseEntity.ok(userService.removeUserRole(sisiId, role));
    }

    @PutMapping("/update-roles")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AuthResponse> updateUserRoles(
            @RequestBody @Valid UserRoleUpdateRequest request
    ) {
        log.info("Хэрэглэгчийн бүх роль шинэчлэх хүсэлт: {}", request.getSisiId());
        return ResponseEntity.ok(userService.updateUserRoles(request));
    }

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        log.info("Бүх хэрэглэгчдийг авах хүсэлт (Админ)");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        log.info("Хэрэглэгч устгах хүсэлт (Админ): {}", userId);
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-user")
    public ResponseEntity<Map<String, Boolean>> checkUserExists(@RequestParam String sisiId) {
        boolean exists = userService.existsBySisiId(sisiId);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        
        return ResponseEntity.ok(response);
    }
} 