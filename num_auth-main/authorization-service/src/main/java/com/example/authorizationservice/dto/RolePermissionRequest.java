package com.example.authorizationservice.dto;

import lombok.Data;

@Data
public class RolePermissionRequest {
    private String role;
    private String permissionId;
    private Boolean isActive = true;
} 