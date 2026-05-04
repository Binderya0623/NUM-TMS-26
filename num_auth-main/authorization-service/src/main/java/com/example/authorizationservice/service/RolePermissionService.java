package com.example.authorizationservice.service;

import com.example.authorizationservice.dto.PermissionResponse;
import com.example.authorizationservice.dto.RolePermissionRequest;
import com.example.authorizationservice.dto.RolePermissionResponse;
import com.example.authorizationservice.model.Permission;
import com.example.authorizationservice.model.RolePermission;
import com.example.authorizationservice.repository.PermissionRepository;
import com.example.authorizationservice.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RolePermissionService {

    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;

    public RolePermissionResponse assignPermissionToRole(RolePermissionRequest request) {
        if (rolePermissionRepository.existsByRoleAndPermission_Id(request.getRole(), request.getPermissionId())) {
            throw new RuntimeException("Энэ зөвшөөрөл энэ рольд аль хэдийн оноогдсон байна");
        }

        Permission permission = permissionRepository.findById(request.getPermissionId())
                .orElseThrow(() -> new RuntimeException("Зөвшөөрөл олдсонгүй"));

        RolePermission rolePermission = RolePermission.builder()
                .role(request.getRole())
                .permission(permission)
                .isActive(request.getIsActive())
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        RolePermission savedRolePermission = rolePermissionRepository.save(rolePermission);
        log.info("Зөвшөөрөл рольд оноогдлоо: Роль {}, Зөвшөөрөл {}", 
                savedRolePermission.getRole(), savedRolePermission.getPermission().getName());

        return mapToRolePermissionResponse(savedRolePermission);
    }

    public List<RolePermissionResponse> getPermissionsByRole(String role) {
        List<RolePermission> rolePermissions = rolePermissionRepository.findByRole(role);
        return rolePermissions.stream()
                .map(this::mapToRolePermissionResponse)
                .collect(Collectors.toList());
    }

    public List<RolePermissionResponse> getActivePermissionsByRole(String role) {
        List<RolePermission> rolePermissions = rolePermissionRepository.findByRoleAndIsActiveTrue(role);
        return rolePermissions.stream()
                .map(this::mapToRolePermissionResponse)
                .collect(Collectors.toList());
    }

    public RolePermissionResponse updateRolePermission(String id, RolePermissionRequest request) {
        RolePermission rolePermission = rolePermissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Роль-зөвшөөрөл холбоос олдсонгүй"));

        Permission permission = permissionRepository.findById(request.getPermissionId())
                .orElseThrow(() -> new RuntimeException("Зөвшөөрөл олдсонгүй"));

        rolePermission.setRole(request.getRole());
        rolePermission.setPermission(permission);
        rolePermission.setActive(request.getIsActive());
        rolePermission.setUpdatedAt(new Date());

        RolePermission updatedRolePermission = rolePermissionRepository.save(rolePermission);
        log.info("Роль-зөвшөөрөл холбоос шинэчлэгдлээ: ID {}", updatedRolePermission.getId());

        return mapToRolePermissionResponse(updatedRolePermission);
    }

    public void deleteRolePermission(String id) {
        if (!rolePermissionRepository.existsById(id)) {
            throw new RuntimeException("Роль-зөвшөөрөл холбоос олдсонгүй");
        }
        rolePermissionRepository.deleteById(id);
        log.info("Роль-зөвшөөрөл холбоос устгагдлаа. ID: {}", id);
    }

    private RolePermissionResponse mapToRolePermissionResponse(RolePermission rolePermission) {
        return RolePermissionResponse.builder()
                .id(rolePermission.getId())
                .role(rolePermission.getRole())
                .permission(mapToPermissionResponse(rolePermission.getPermission()))
                .isActive(rolePermission.isActive())
                .createdAt(rolePermission.getCreatedAt())
                .updatedAt(rolePermission.getUpdatedAt())
                .build();
    }

    private PermissionResponse mapToPermissionResponse(Permission permission) {
        return PermissionResponse.builder()
                .id(permission.getId())
                .name(permission.getName())
                .description(permission.getDescription())
                .isActive(permission.isActive())
                .createdAt(permission.getCreatedAt())
                .updatedAt(permission.getUpdatedAt())
                .build();
    }
} 