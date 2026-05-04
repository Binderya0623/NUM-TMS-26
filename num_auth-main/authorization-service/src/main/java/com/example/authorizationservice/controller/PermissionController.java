package com.example.authorizationservice.controller;

import com.example.authorizationservice.dto.PermissionRequest;
import com.example.authorizationservice.model.Permission;
import com.example.authorizationservice.service.PermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/authorization/permissions")
@RequiredArgsConstructor
@Slf4j
public class PermissionController {

    private final PermissionService permissionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Permission> createPermission(@Valid @RequestBody PermissionRequest request) {
        log.info("Зөвшөөрөл үүсгэх хүсэлт хүлээн авлаа: {}", request.getName());
        Permission createdPermission = permissionService.createPermission(request);
        return new ResponseEntity<>(createdPermission, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Permission> updatePermission(
            @PathVariable String id,
            @Valid @RequestBody PermissionRequest request
    ) {
        log.info("Зөвшөөрөл шинэчлэх хүсэлт хүлээн авлаа. ID: {}, Нэр: {}", id, request.getName());
        Permission updatedPermission = permissionService.updatePermission(id, request);
        return ResponseEntity.ok(updatedPermission);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePermission(@PathVariable String id) {
        log.info("Зөвшөөрөл устгах хүсэлт хүлээн авлаа. ID: {}", id);
        permissionService.deletePermission(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Permission> getPermissionById(@PathVariable String id) {
        log.info("Зөвшөөрөл харах хүсэлт хүлээн авлаа. ID: {}", id);
        Permission permission = permissionService.getPermissionById(id);
        return ResponseEntity.ok(permission);
    }

    @GetMapping("/name/{name}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Permission> getPermissionByName(@PathVariable String name) {
        log.info("Зөвшөөрөл харах хүсэлт хүлээн авлаа. Нэр: {}", name);
        Permission permission = permissionService.getPermissionByName(name);
        return ResponseEntity.ok(permission);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        log.info("Бүх зөвшөөрлүүдийг харах хүсэлт хүлээн авлаа");
        List<Permission> permissions = permissionService.getAllPermissions();
        return ResponseEntity.ok(permissions);
    }

} 