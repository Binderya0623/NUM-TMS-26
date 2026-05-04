package com.example.authservice.service;

import com.example.authservice.dto.AuthRequest;
import com.example.authservice.dto.AuthResponse;
import com.example.authservice.dto.RegisterRequest;
import com.example.authservice.dto.UserRoleUpdateRequest;
import com.example.authservice.dto.UserResponse;
import com.example.authservice.model.User;
import com.example.authservice.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    
    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    @Lazy
    private AuthenticationManager authenticationManager;

    @Autowired
    public UserService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Override
    public UserDetails loadUserByUsername(String sisiId) throws UsernameNotFoundException {
        return userRepository.findBySisiId(sisiId)
                .orElseThrow(() -> new UsernameNotFoundException("Хэрэглэгч олдсонгүй: " + sisiId));
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsBySisiId(request.getSisiId())) {
            throw new RuntimeException("Хэрэглэгч аль хэдийн бүртгэгдсэн байна");
        }

        List<String> roles = request.getRoles();
        if (roles == null || roles.isEmpty()) {
            roles = new ArrayList<>();
            roles.add("ROLE_USER");
        }

        // Log the received password for debugging
        log.info("Бүртгэлийн хүсэлт доторх нууц үг: '{}'", request.getPassword());

        String passwordToUse;
        boolean passwordGenerated = false;
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            passwordToUse = request.getPassword();
            log.info("Бүртгэлийн хүсэлтээс нууц үг ашиглаж байна: {}", request.getSisiId());
        } else {
            passwordToUse = generateRandomPassword();
            passwordGenerated = true;
            log.info("Шинэ нууц үг үүсгэж байна: {}", request.getSisiId());
        }
        
        User user = User.builder()
                .sisiId(request.getSisiId())
                .password(passwordEncoder.encode(passwordToUse))
                .phoneNumber(request.getPhoneNumber())
                .roles(roles)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(user, user.getRoles());

        // Send SMS only if password was generated and phone number exists
        if (passwordGenerated && request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
            sendPasswordToUser(request.getPhoneNumber(), passwordToUse);
        }

        return AuthResponse.builder()
                .id(savedUser.getId())
                .sisiId(savedUser.getSisiId())
                .phoneNumber(savedUser.getPhoneNumber())
                .token(token)
                .roles(savedUser.getRoles())
                .build();
    }
    
    private String generateRandomPassword() {
        int min = 100000;
        int max = 999999;
        return String.valueOf(min + (int)(Math.random() * ((max - min) + 1)));
    }
    
    private void sendPasswordToUser(String phoneNumber, String password) {
        log.info("Дараах дугаарлуу нууц үг илгээгдлээ: {}, Нууц үг: {}", phoneNumber, password);
        // TODO: SMS API-тай холбох
    }

    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getSisiId(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            log.error("Нэвтрэх үед алдаа гарлаа - sisiId: {}", request.getSisiId(), e);
            throw new RuntimeException("Хэрэглэгчийн нэр эсвэл нууц үг буруу байна", e);
        }

        User user = userRepository.findBySisiId(request.getSisiId())
                .orElseThrow(() -> new UsernameNotFoundException("Хэрэглэгч олдсонгүй"));

        String token = jwtService.generateToken(user, user.getRoles());

        return AuthResponse.builder()
                .id(user.getId())
                .sisiId(user.getSisiId())
                .phoneNumber(user.getPhoneNumber())
                .token(token)
                .roles(user.getRoles())
                .build();
    }

    public AuthResponse updateUserRoles(UserRoleUpdateRequest request) {
        User user = userRepository.findBySisiId(request.getSisiId())
                .orElseThrow(() -> new UsernameNotFoundException("Хэрэглэгч олдсонгүй: " + request.getSisiId()));
        
        user.setRoles(request.getRoles());
        user.setUpdatedAt(new Date());
        
        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser, savedUser.getRoles());
        
        return AuthResponse.builder()
                .id(savedUser.getId())
                .sisiId(savedUser.getSisiId())
                .phoneNumber(savedUser.getPhoneNumber())
                .token(token)
                .roles(savedUser.getRoles())
                .build();
    }

    public AuthResponse addUserRole(String sisiId, String newRole) {
        User user = userRepository.findBySisiId(sisiId)
                .orElseThrow(() -> new UsernameNotFoundException("Хэрэглэгч олдсонгүй: " + sisiId));
        
        List<String> roles = new ArrayList<>(user.getRoles());
        if (!roles.contains(newRole)) {
            roles.add(newRole);
            user.setRoles(roles);
            user.setUpdatedAt(new Date());
            
            User savedUser = userRepository.save(user);
            String token = jwtService.generateToken(savedUser, savedUser.getRoles());
            
            return AuthResponse.builder()
                    .id(savedUser.getId())
                    .sisiId(savedUser.getSisiId())
                    .phoneNumber(savedUser.getPhoneNumber())
                    .token(token)
                    .roles(savedUser.getRoles())
                    .build();
        }
        
        return AuthResponse.builder()
                .id(user.getId())
                .sisiId(user.getSisiId())
                .phoneNumber(user.getPhoneNumber())
                .token(jwtService.generateToken(user, user.getRoles()))
                .roles(user.getRoles())
                .build();
    }
    
    public AuthResponse removeUserRole(String sisiId, String roleToRemove) {
        User user = userRepository.findBySisiId(sisiId)
                .orElseThrow(() -> new UsernameNotFoundException("Хэрэглэгч олдсонгүй: " + sisiId));
        
        List<String> roles = new ArrayList<>(user.getRoles());
        if (roles.remove(roleToRemove)) {
            user.setRoles(roles);
            user.setUpdatedAt(new Date());
            
            User savedUser = userRepository.save(user);
            String token = jwtService.generateToken(savedUser, savedUser.getRoles());
            
            return AuthResponse.builder()
                    .id(savedUser.getId())
                    .sisiId(savedUser.getSisiId())
                    .phoneNumber(savedUser.getPhoneNumber())
                    .token(token)
                    .roles(savedUser.getRoles())
                    .build();
        }
        
        return AuthResponse.builder()
                .id(user.getId())
                .sisiId(user.getSisiId())
                .phoneNumber(user.getPhoneNumber())
                .token(jwtService.generateToken(user, user.getRoles()))
                .roles(user.getRoles())
                .build();
    }

    public List<UserResponse> getAllUsers() {
        log.info("Бүх хэрэглэгчдийг авч байна...");
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .sisiId(user.getSisiId())
                .roles(user.getRoles())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Хэрэглэгч олдсонгүй: " + userId));

        // Хэрэглэгчийг устгах
        userRepository.delete(user);
        log.info("Хэрэглэгч амжилттай устгагдлаа: {}", userId);
    }

    public boolean existsBySisiId(String sisiId) {
        return userRepository.existsBySisiId(sisiId);
    }

} 