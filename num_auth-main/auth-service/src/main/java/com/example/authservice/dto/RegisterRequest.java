package com.example.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Хэрэглэгчийн ID оруулна уу")
    private String sisiId;
    
    private String password;
    
    private String phoneNumber;
    
    private List<String> roles;

    private String firstName;
    private String lastName;
    private String email;
}