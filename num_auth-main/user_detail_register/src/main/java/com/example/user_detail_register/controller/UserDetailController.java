package com.example.user_detail_register.controller;

import com.example.user_detail_register.dto.UserDetailDto;
import com.example.user_detail_register.model.UserDetail;
import com.example.user_detail_register.service.UserDetailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/user-details")
@RequiredArgsConstructor
@Slf4j
public class UserDetailController {

    private final UserDetailService userDetailService;
    private final RestTemplate restTemplate;
    
    // @Value("${auth.service.url:http://localhost:8081}")
    @Value("${auth.service.url:http://52.77.99.18:8081}")
    private String authServiceUrl;

    @PostMapping
    public ResponseEntity<?> createUserDetail(@RequestBody UserDetailDto userDetailDto) {
        try {
            // Хэрэглэгчийн нэр (sisiId) ашиглан auth service-д бүртгэлтэй эсэхийг шалгах
            boolean isRegistered = checkUserExistsInAuthService(userDetailDto.getSisiId());
            
            // Хэрэв хэрэглэгч auth service-д бүртгэлгүй бол автоматаар үүсгэх
            if (!isRegistered && userDetailDto.getSisiId() != null && !userDetailDto.getSisiId().isEmpty()) {
                // Автоматаар User account үүсгэх (USER роль-той)
                registerUserInAuthService(userDetailDto);
            }
            
            UserDetail userDetail = UserDetail.builder()
                    .sisiId(userDetailDto.getSisiId())
                    .firstName(userDetailDto.getFirstName())
                    .lastName(userDetailDto.getLastName())
                    .registerNumber(userDetailDto.getRegisterNumber())
                    .university(userDetailDto.getUniversity())
                    .courseYear(userDetailDto.getCourseYear())
                    .build();
            UserDetail createdUserDetail = userDetailService.createUserDetail(userDetail);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUserDetail);
        } catch (Exception e) {
            log.error("Хэрэглэгчийн дэлгэрэнгүй мэдээлэл үүсгэхэд алдаа гарлаа", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    /**
     * Auth service-д хэрэглэгч бүртгэлтэй эсэхийг шалгах
     */
    private boolean checkUserExistsInAuthService(String sisiId) {
        try {
            String url = authServiceUrl + "/auth/check-user?sisiId=" + sisiId;
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (boolean) response.getBody().getOrDefault("exists", false);
            }
            return false;
        } catch (Exception e) {
            log.error("Auth service-д хэрэглэгч шалгах үед алдаа гарлаа", e);
            return false;
        }
    }
    
    /**
     * Auth service-д автоматаар хэрэглэгч үүсгэх
     */
    private void registerUserInAuthService(UserDetailDto userDetailDto) {
        try {
            String url = authServiceUrl + "/auth/register";
            
            // Бүртгэлийн request үүсгэх
            Map<String, Object> request = new HashMap<>();
            request.put("sisiId", userDetailDto.getSisiId());
            
            // Хэрэв утасны дугаар өгсөн бол нууц үг нь sisiId лүү бус утасны дугаар руу автоматаар илгээгдэнэ
            if (userDetailDto.getPhoneNumber() != null && !userDetailDto.getPhoneNumber().isEmpty()) {
                request.put("phoneNumber", userDetailDto.getPhoneNumber());
            }
            
            request.put("roles", new String[]{"ROLE_USER"});
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.CREATED) {
                log.info("Хэрэглэгч {} амжилттай үүсгэгдлээ", userDetailDto.getSisiId());
            } else {
                log.warn("Хэрэглэгч үүсгэх үед алдаа гарлаа: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Auth service-д хэрэглэгч үүсгэх үед алдаа гарлаа", e);
            throw new RuntimeException("Хэрэглэгч үүсгэх боломжгүй: " + e.getMessage());
        }
    }

    @GetMapping("/sisi-user/{sisiId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getUserBySisiId(@PathVariable String sisiId) {
        Optional<UserDetail> userDetail = userDetailService.getUserDetailBySisiId(sisiId);
        
        if (userDetail.isPresent()) {
            return ResponseEntity.ok(userDetail.get());
        } else {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Хэрэглэгч олдсонгүй");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @GetMapping("/register/{registerNumber}")
    public ResponseEntity<?> getUserByRegisterNumber(@PathVariable String registerNumber) {
        Optional<UserDetail> userDetail = userDetailService.getUserDetailByRegisterNumber(registerNumber);
        
        if (userDetail.isPresent()) {
            return ResponseEntity.ok(userDetail.get());
        } else {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Хэрэглэгч олдсонгүй");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserDetail(@PathVariable String id, @RequestBody UserDetailDto userDetailDto) {
        try {
            UserDetail userDetail = UserDetail.builder()
                    .firstName(userDetailDto.getFirstName())
                    .lastName(userDetailDto.getLastName())
                    .registerNumber(userDetailDto.getRegisterNumber())
                    .university(userDetailDto.getUniversity())
                    .courseYear(userDetailDto.getCourseYear())
                    .build();
            
            UserDetail updatedUserDetail = userDetailService.updateUserDetail(id, userDetail);
            return ResponseEntity.ok(updatedUserDetail);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
} 