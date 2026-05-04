// package com.example.authservice.service;

// import com.example.authservice.model.User;
// import io.jsonwebtoken.Claims;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.DisplayName;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import org.mockito.InjectMocks;
// import org.mockito.junit.jupiter.MockitoExtension;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.test.util.ReflectionTestUtils;

// import java.util.ArrayList;
// import java.util.Date;
// import java.util.List;

// import static org.junit.jupiter.api.Assertions.*;

// @ExtendWith(MockitoExtension.class)
// class JwtServiceTest {

//     @InjectMocks
//     private JwtService jwtService;

//     private User testUser;
//     private String secretKey;
//     private long expiration;

//     @BeforeEach
//     void setUp() {
//         // Тест хэрэглэгч үүсгэх
//         List<String> roles = new ArrayList<>();
//         roles.add("ROLE_USER");

//         testUser = User.builder()
//                 .id("1")
//                 .sisiId("testUser")
//                 .password("encodedPassword")
//                 .roles(roles)
//                 .createdAt(new Date())
//                 .updatedAt(new Date())
//                 .build();
        
//         // JwtService-д шаардлагатай утгууд зааж өгөх
//         secretKey = "YW5kMTIzNDU2Nzg5MGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MTIzNDU2Nzg5MA=="; 
//         expiration = 3600000; 
        
//         ReflectionTestUtils.setField(jwtService, "secretKey", secretKey);
//         ReflectionTestUtils.setField(jwtService, "jwtExpiration", expiration);
//     }

//     @Test
//     @DisplayName("JWT токен үүсгэх")
//     void testGenerateToken() {
//         // Тохируулах
//         List<String> roles = new ArrayList<>(testUser.getRoles());
        
//         // Ажиллуулах
//         String token = jwtService.generateToken(testUser, roles);
        
//         // Шалгах
//         assertNotNull(token);
//         assertTrue(token.length() > 0);
//     }
    
//     @Test
//     @DisplayName("JWT токеноос хэрэглэгчийн нэр авах")
//     void testExtractUsername() {
//         // Тохируулах
//         List<String> roles = new ArrayList<>(testUser.getRoles());
//         String token = jwtService.generateToken(testUser, roles);
        
//         // Ажиллуулах
//         String username = jwtService.extractUsername(token);
        
//         // Шалгах
//         assertEquals("testUser", username);
//     }
    
//     @Test
//     @DisplayName("JWT токен хүчинтэй эсэхийг шалгах - амжилттай")
//     void testIsTokenValidSuccess() {
//         // Тохируулах
//         List<String> roles = new ArrayList<>(testUser.getRoles());
//         String token = jwtService.generateToken(testUser, roles);
        
//         // Ажиллуулах
//         boolean isValid = jwtService.isTokenValid(token, testUser);
        
//         // Шалгах
//         assertTrue(isValid);
//     }
    
//     @Test
//     @DisplayName("JWT токен хүчинтэй эсэхийг шалгах - хэрэглэгчийн нэр таарахгүй")
//     void testIsTokenValidWrongUsername() {
//         // Тохируулах
//         List<String> roles = new ArrayList<>(testUser.getRoles());
//         String token = jwtService.generateToken(testUser, roles);
        
//         // Өөр хэрэглэгч үүсгэх
//         User otherUser = User.builder()
//                 .id("2")
//                 .sisiId("otherUser")
//                 .password("encodedPassword")
//                 .roles(roles)
//                 .build();
        
//         // Ажиллуулах
//         boolean isValid = jwtService.isTokenValid(token, otherUser);
        
//         // Шалгах
//         assertFalse(isValid);
//     }
    
//     @Test
//     @DisplayName("JWT токеноос тодорхой мэдээлэл авах")
//     void testExtractClaim() {
//         // Тохируулах
//         List<String> roles = new ArrayList<>(testUser.getRoles());
//         String token = jwtService.generateToken(testUser, roles);
        
//         // Ажиллуулах
//         String subject = jwtService.extractClaim(token, Claims::getSubject);
        
//         // Шалгах
//         assertEquals("testUser", subject);
//     }
// } 