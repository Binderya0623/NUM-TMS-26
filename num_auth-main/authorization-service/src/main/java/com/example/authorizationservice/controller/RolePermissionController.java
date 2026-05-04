package com.example.authorizationservice.controller;

import com.example.authorizationservice.dto.RolePermissionRequest;
import com.example.authorizationservice.dto.RolePermissionResponse;
import com.example.authorizationservice.service.RolePermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/authorization/role-permissions")
@RequiredArgsConstructor
@Slf4j
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RolePermissionResponse> assignPermissionToRole(@Valid @RequestBody RolePermissionRequest request) {
        log.info("Зөвшөөрөл рольд оноох хүсэлт: Роль {}, Зөвшөөрөл ID {}", request.getRole(), request.getPermissionId());
        return new ResponseEntity<>(rolePermissionService.assignPermissionToRole(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RolePermissionResponse> updateRolePermission(
            @PathVariable String id,
            @Valid @RequestBody RolePermissionRequest request
    ) {
        log.info("Роль-зөвшөөрөл холбоос шинэчлэх хүсэлт. ID: {}", id);
        return ResponseEntity.ok(rolePermissionService.updateRolePermission(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRolePermission(@PathVariable String id) {
        log.info("Роль-зөвшөөрөл холбоос устгах хүсэлт. ID: {}", id);
        rolePermissionService.deleteRolePermission(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<List<RolePermissionResponse>> getPermissionsByRole(@PathVariable String role) {
        log.info("Ролийн зөвшөөрлүүдийг харах хүсэлт: Роль {}", role);
        return ResponseEntity.ok(rolePermissionService.getPermissionsByRole(role));
    }

    @GetMapping("/role/{role}/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<RolePermissionResponse>> getActivePermissionsByRole(@PathVariable String role) {
        log.info("Ролийн идэвхтэй зөвшөөрлүүдийг харах хүсэлт: Роль {}", role);
        return ResponseEntity.ok(rolePermissionService.getActivePermissionsByRole(role));
    }
} 