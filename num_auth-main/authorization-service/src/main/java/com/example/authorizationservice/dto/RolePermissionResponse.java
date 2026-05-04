package com.example.authorizationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionResponse {
    private String id;
    private String role;
    private PermissionResponse permission;
    private boolean isActive;
    private Date createdAt;
    private Date updatedAt;
} 