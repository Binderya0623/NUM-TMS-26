package com.example.authorizationservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "role_permissions")
public class RolePermission {
    
    @Id
    private String id;
    private String role;
    
    @DBRef
    private Permission permission;
    
    private boolean isActive;
    private Date createdAt;
    private Date updatedAt;
} 

