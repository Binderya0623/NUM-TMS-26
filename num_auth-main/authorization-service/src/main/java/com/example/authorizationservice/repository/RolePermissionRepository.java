package com.example.authorizationservice.repository;

import com.example.authorizationservice.model.RolePermission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RolePermissionRepository extends MongoRepository<RolePermission, String> {
    List<RolePermission> findByRole(String role);
    List<RolePermission> findByRoleAndIsActiveTrue(String role);
    boolean existsByRoleAndPermission_Id(String role, String permissionId);
} 