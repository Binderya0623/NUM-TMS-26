package com.tms.thesissystem.api;

import com.tms.thesissystem.application.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public ApiDtos.LoginResponse login(@RequestBody LoginRequest request) {
        ApiDtos.LoginResponse response = authService.login(request.username(), request.password());
        if (!response.ok()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, response.message());
        }
        return response;
    }

    public record LoginRequest(String username, String password) {
    }
}
