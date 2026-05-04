package com.example.authorizationservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PermissionRequest {
    @NotBlank(message = "Зөвшөөрлийн нэр хоосон байж болохгүй")
    private String name;
    private String description;
    private Boolean isActive = true;
} 