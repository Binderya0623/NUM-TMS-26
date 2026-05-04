package com.example.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {
    
    @NotBlank(message = "Хэрэглэгчийн нэр оруулна уу")
    private String sisiId;
    
    @NotBlank(message = "Нууц үг оруулна уу")
    private String password;
} 