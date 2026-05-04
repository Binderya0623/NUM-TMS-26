package com.example.authorizationservice.service;

import com.example.authorizationservice.dto.PermissionRequest;
import com.example.authorizationservice.dto.PermissionResponse;
import com.example.authorizationservice.dto.RolePermissionRequest;
import com.example.authorizationservice.dto.RolePermissionResponse;
import com.example.authorizationservice.exception.ResourceNotFoundException;
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
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    // Зөвшөөрөл үүсгэх
    public Permission createPermission(PermissionRequest request) {
        if (permissionRepository.existsByName(request.getName())) {
            throw new RuntimeException("Энэ нэртэй зөвшөөрөл аль хэдийн үүссэн байна.");
        }

        Permission permission = Permission.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isActive(request.getIsActive())
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();
        
        Permission savedPermission = permissionRepository.save(permission);
        log.info("Зөвшөөрөл амжилттай үүслээ: {}", savedPermission.getName());
        return savedPermission;
    }

    // Зөвшөөрөл шинэчлэх
    public Permission updatePermission(String id, PermissionRequest request) {
        Permission permission = getPermissionById(id);
        
        // Нэр давхцаж байгаа эсэхийг шалгах (өөрийнх нь нэр биш бол)
        if (!permission.getName().equals(request.getName()) && permissionRepository.existsByName(request.getName())) {
            throw new RuntimeException("Энэ нэртэй зөвшөөрөл аль хэдийн үүссэн байна.");
        }

        permission.setName(request.getName());
        permission.setDescription(request.getDescription());
        permission.setActive(request.getIsActive());
        permission.setUpdatedAt(new Date());

        Permission updatedPermission = permissionRepository.save(permission);
        log.info("Зөвшөөрөл амжилттай шинэчлэгдлээ: {}", updatedPermission.getName());
        return updatedPermission;
    }

    // Зөвшөөрөл устгах
    public void deletePermission(String id) {
        Permission permission = getPermissionById(id);
        permissionRepository.delete(permission);
        // TODO: Энэ зөвшөөрөлтэй холбоотой role_permissions-г устгах эсвэл идэвхгүй болгох
        log.info("Зөвшөөрөл амжилттай устгагдлаа: {}", permission.getName());
    }

    // Бүх зөвшөөрлийг авах
    public List<Permission> getAllPermissions() {
        log.info("Бүх зөвшөөрлийг авч байна");
        return permissionRepository.findAll();
    }

    // ID-аар зөвшөөрөл авах
    public Permission getPermissionById(String id) {
        log.info("ID-аар зөвшөөрөл хайж байна: {}", id);
        return permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ID-тай зөвшөөрөл олдсонгүй: " + id));
    }

    // Нэрээр зөвшөөрөл авах
    public Permission getPermissionByName(String name) {
        log.info("Нэрээр зөвшөөрөл хайж байна: {}", name);
        return permissionRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Нэртэй зөвшөөрөл олдсонгүй: " + name));
    }

    // Рольд зөвшөөрөл оноох
    public RolePermissionResponse assignPermissionToRole(RolePermissionRequest request) {
        Permission permission = getPermissionById(request.getPermissionId());
        
        if (rolePermissionRepository.existsByRoleAndPermission_Id(request.getRole(), request.getPermissionId())) {
            throw new RuntimeException(String.format("%s рольд %s зөвшөөрөл аль хэдийн оноогдсон байна.", request.getRole(), permission.getName()));
        }

        RolePermission rolePermission = RolePermission.builder()
                .role(request.getRole())
                .permission(permission)
                .isActive(request.getIsActive())
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        RolePermission savedRolePermission = rolePermissionRepository.save(rolePermission);
        log.info("{} рольд {} зөвшөөрөл амжилттай оноолоо.", request.getRole(), permission.getName());
        return mapToRolePermissionResponse(savedRolePermission);
    }

    // Ролиос зөвшөөрөл хасах
    public void removePermissionFromRole(String rolePermissionId) {
        RolePermission rolePermission = rolePermissionRepository.findById(rolePermissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Оноосон зөвшөөрөл олдсонгүй: " + rolePermissionId));
        
        rolePermissionRepository.delete(rolePermission);
        log.info("{} рольд оноосон {} зөвшөөрлийг амжилттай хаслаа.", rolePermission.getRole(), rolePermission.getPermission().getName());
    }
    
    // Ролийн идэвхтэй зөвшөөрлүүдийг авах
    public List<RolePermissionResponse> getActivePermissionsByRole(String role) {
        log.info("{} ролийн идэвхтэй зөвшөөрлүүдийг авч байна", role);
        List<RolePermission> rolePermissions = rolePermissionRepository.findByRoleAndIsActiveTrue(role);
        return rolePermissions.stream()
                .<RolePermissionResponse>map(this::mapToRolePermissionResponse)
                .collect(Collectors.toList());
    }

    // RolePermission-г RolePermissionResponse руу хөрвүүлэх
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

    // Permission-г PermissionResponse руу хөрвүүлэх
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