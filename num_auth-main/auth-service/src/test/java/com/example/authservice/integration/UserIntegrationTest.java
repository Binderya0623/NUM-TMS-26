package com.example.authservice.integration;

import com.example.authservice.model.User;
import com.example.authservice.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class UserIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User adminUser = User.builder()
                .sisiId("admin")
                .password(passwordEncoder.encode("admin123"))
                .roles(Collections.singletonList("ROLE_ADMIN"))
                .build();

        userRepository.save(adminUser);
    }

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Админ хэрэглэгч бүх хэрэглэгчийн жагсаалтыг авна")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testAdminCanGetAllUsers() throws Exception {
        mockMvc.perform(get("/auth/users")
                        .header("X-User-ID", "admin")
                        .header("X-User-Roles", "ROLE_ADMIN"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Энгийн хэрэглэгч жагсаалт авах үед хориглоно")
    @WithMockUser(username = "user", roles = {"USER"})
    void testNonAdminCannotGetAllUsers() throws Exception {
        mockMvc.perform(get("/auth/users")
                        .header("X-User-ID", "user")
                        .header("X-User-Roles", "ROLE_USER"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Хоосон өгөгдлийн санд хэрэглэгч байхгүй үед хоосон буцаана")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testEmptyUserList() throws Exception {
        userRepository.deleteAll();
        mockMvc.perform(get("/auth/users")
                        .header("X-User-ID", "admin")
                        .header("X-User-Roles", "ROLE_ADMIN"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }
}


// // package com.example.authservice.integration;

// // import com.example.authservice.dto.AuthRequest;
// // import com.example.authservice.dto.AuthResponse;
// // import com.example.authservice.dto.RegisterRequest;
// // import com.example.authservice.model.User;
// // import com.example.authservice.repository.UserRepository;
// // import com.fasterxml.jackson.databind.ObjectMapper;
// // import org.junit.jupiter.api.AfterEach;
// // import org.junit.jupiter.api.BeforeEach;
// // import org.junit.jupiter.api.DisplayName;
// // import org.junit.jupiter.api.Test;
// // import org.springframework.beans.factory.annotation.Autowired;
// // import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
// // import org.springframework.boot.test.context.SpringBootTest;
// // import org.springframework.http.MediaType;
// // import org.springframework.security.crypto.password.PasswordEncoder;
// // import org.springframework.test.context.ActiveProfiles;
// // import org.springframework.test.web.servlet.MockMvc;
// // import org.springframework.test.web.servlet.MvcResult;
// import com.example.authservice.dto.AuthRequest;
// import com.example.authservice.dto.AuthResponse;
// import com.example.authservice.dto.RegisterRequest;
// import com.example.authservice.dto.UserRoleUpdateRequest;
// import com.example.authservice.model.User;
// import com.example.authservice.repository.UserRepository;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import org.junit.jupiter.api.AfterEach;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.DisplayName;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.http.MediaType;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.test.context.support.WithMockUser;
// import org.springframework.test.context.ActiveProfiles;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.test.web.servlet.MvcResult;

// // import java.util.ArrayList;
// // import java.util.List;

// // import static org.junit.jupiter.api.Assertions.assertEquals;
// // import static org.junit.jupiter.api.Assertions.assertNotNull;
// // import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
// // import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
// // import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// // @SpringBootTest
// // @AutoConfigureMockMvc
// // @ActiveProfiles("test") 
// // class UserIntegrationTest {

// //     @Autowired
// //     private MockMvc mockMvc;

// //     @Autowired
// //     private ObjectMapper objectMapper;

// //     @Autowired
// //     private UserRepository userRepository;

// //     @Autowired
// //     private PasswordEncoder passwordEncoder;

// //     private User adminUser;
// //     private String adminToken;

// //     @BeforeEach
// //     void setUp() throws Exception {
// //         // Тестийн өмнө бүх хэрэглэгчдийг устгах
// //         userRepository.deleteAll();
        
// //         // Тест админ хэрэглэгч үүсгэх
// //         createAdminUser();
        
// //         // Админ хэрэглэгчээр нэвтэрч токен авах
// //         adminToken = loginAsAdmin();
// //     }

// //     @AfterEach
// //     void tearDown() {
// //         // Тестийн дараа бүх хэрэглэгчдийг устгах
// //         userRepository.deleteAll();
// //     }

// //     /**
// //      * Тест админ хэрэглэгч үүсгэх
// //      */
// //     private void createAdminUser() {
// //         List<String> roles = new ArrayList<>();
// //         roles.add("ROLE_ADMIN");
        
// //         adminUser = User.builder()
// //                 .sisiId("admin")
// //                 .password(passwordEncoder.encode("admin123"))
// //                 .roles(roles)
// //                 .build();
                
// //         userRepository.save(adminUser);
// //     }
    
// //     /**
// //      * Админ хэрэглэгчээр нэвтрэх
// //      */
// //     private String loginAsAdmin() throws Exception {
// //         AuthRequest authRequest = new AuthRequest();
// //         authRequest.setSisiId("admin");
// //         authRequest.setPassword("admin123");
        
// //         MvcResult result = mockMvc.perform(post("/auth/login")
// //                 .contentType(MediaType.APPLICATION_JSON)
// //                 .content(objectMapper.writeValueAsString(authRequest)))
// //                 .andExpect(status().isOk())
// //                 .andReturn();
                
// //         AuthResponse authResponse = objectMapper.readValue(
// //                 result.getResponse().getContentAsString(),
// //                 AuthResponse.class
// //         );
        
// //         return authResponse.getToken();
// //     }

// //     @Test
// //     @DisplayName("Хэрэглэгч нэвтрэх")
// //     void testLoginUser() throws Exception {
// //         // Эхлээд хэрэглэгч үүсгэх
// //         RegisterRequest registerRequest = new RegisterRequest();
// //         registerRequest.setSisiId("loginUser");
// //         registerRequest.setPassword("password123");
        
// //         mockMvc.perform(post("/auth/register")
// //                 .contentType(MediaType.APPLICATION_JSON)
// //                 .content(objectMapper.writeValueAsString(registerRequest)))
// //                 .andExpect(status().isOk());
                
// //         // Дараа нь хэрэглэгчээр нэвтрэх
// //         AuthRequest authRequest = new AuthRequest();
// //         authRequest.setSisiId("loginUser");
// //         authRequest.setPassword("password123");
        
// //         MvcResult result = mockMvc.perform(post("/auth/login")
// //                 .contentType(MediaType.APPLICATION_JSON)
// //                 .content(objectMapper.writeValueAsString(authRequest)))
// //                 .andExpect(status().isOk())
// //                 .andReturn();
                
// //         // Хариу шалгах
// //         AuthResponse response = objectMapper.readValue(
// //                 result.getResponse().getContentAsString(),
// //                 AuthResponse.class
// //         );
        
// //         assertNotNull(response);
// //         assertEquals("loginUser", response.getSisiId());
// //         assertNotNull(response.getToken());
// //     }
    
// //     @Test
// //     @DisplayName("Буруу нууц үгээр нэвтрэх оролдлого")
// //     void testLoginWithWrongPassword() throws Exception {
// //         // Эхлээд хэрэглэгч үүсгэх
// //         RegisterRequest registerRequest = new RegisterRequest();
// //         registerRequest.setSisiId("loginUserWrongPass");
// //         registerRequest.setPassword("password123");
        
// //         mockMvc.perform(post("/auth/register")
// //                 .contentType(MediaType.APPLICATION_JSON)
// //                 .content(objectMapper.writeValueAsString(registerRequest)))
// //                 .andExpect(status().isOk());
                
// //         // Буруу нууц үгээр нэвтрэх оролдлого
// //         AuthRequest authRequest = new AuthRequest();
// //         authRequest.setSisiId("loginUserWrongPass");
// //         authRequest.setPassword("wrongpassword");
        
// //         mockMvc.perform(post("/auth/login")
// //                 .contentType(MediaType.APPLICATION_JSON)
// //                 .content(objectMapper.writeValueAsString(authRequest)))
// //                 .andExpect(status().isUnauthorized());
// //     }
    
// //     @Test
// //     @DisplayName("Байхгүй хэрэглэгчээр нэвтрэх оролдлого")
// //     void testLoginWithNonExistingUser() throws Exception {
// //         // Байхгүй хэрэглэгчээр нэвтрэх оролдлого
// //         AuthRequest authRequest = new AuthRequest();
// //         authRequest.setSisiId("nonExistingUser");
// //         authRequest.setPassword("password123");
        
// //         mockMvc.perform(post("/auth/login")
// //                 .contentType(MediaType.APPLICATION_JSON)
// //                 .content(objectMapper.writeValueAsString(authRequest)))
// //                 .andExpect(status().isUnauthorized());
// //     }
    
// //     @Test
// //     @DisplayName("Хоосон нэр нууц үгээр нэвтрэх оролдлого")
// //     void testLoginWithEmptyCredentials() throws Exception {
// //         // Хоосон нэр нууц үгээр нэвтрэх
// //         AuthRequest authRequest = new AuthRequest();
// //         authRequest.setSisiId("");
// //         authRequest.setPassword("");
        
// //         mockMvc.perform(post("/auth/login")
// //                 .contentType(MediaType.APPLICATION_JSON)
// //                 .content(objectMapper.writeValueAsString(authRequest)))
// //                 .andExpect(status().isBadRequest());
// //     }
    
// //     @Test
// //     @DisplayName("Логин амжилттай хийсний дараа токен хүчинтэй эсэх")
// //     void testLoginTokenValidity() throws Exception {
// //         // Эхлээд хэрэглэгч үүсгэх
// //         RegisterRequest registerRequest = new RegisterRequest();
// //         registerRequest.setSisiId("tokenValidityUser");
// //         registerRequest.setPassword("password123");

// //         List<String> roles = new ArrayList<>();
// //         roles.add("ROLE_USER");
// //         registerRequest.setRoles(roles);
        
// //         mockMvc.perform(post("/auth/register")
// //                 .contentType(MediaType.APPLICATION_JSON)
// //                 .content(objectMapper.writeValueAsString(registerRequest)))
// //                 .andExpect(status().isOk());
                
// //         // Хэрэглэгчээр нэвтрэх
// //         AuthRequest authRequest = new AuthRequest();
// //         authRequest.setSisiId("tokenValidityUser");
// //         authRequest.setPassword("password123");
        
// //         MvcResult result = mockMvc.perform(post("/auth/login")
// //                 .contentType(MediaType.APPLICATION_JSON)
// //                 .content(objectMapper.writeValueAsString(authRequest)))
// //                 .andExpect(status().isOk())
// //                 .andReturn();
                
// //         // Авсан токеныг хадгалах
// //         AuthResponse response = objectMapper.readValue(
// //                 result.getResponse().getContentAsString(),
// //                 AuthResponse.class
// //         );
        
// //         String userToken = response.getToken();
// //         assertNotNull(userToken);
        
// //         // Токен ашиглан authorized endpoint руу хүсэлт илгээх
// //         mockMvc.perform(put("/auth/add-role")
// //                 .header("Authorization", "Bearer " + adminToken)
// //                 .param("sisiId", "tokenValidityUser")
// //                 .param("role", "ROLE_MANAGER"))
// //                 .andExpect(status().isOk());
// //     }
// // } 
// @SpringBootTest
// @AutoConfigureMockMvc
// @ActiveProfiles("test")
// class UserIntegrationTest {

//         @Autowired
//         private MockMvc mockMvc;

//         @Autowired
//         private ObjectMapper objectMapper;

//         @Autowired
//         private UserRepository userRepository;

//         @Autowired
//         private PasswordEncoder passwordEncoder;

//         private User adminUser;
//         private String adminToken;

//         @BeforeEach
//         void setUp() throws Exception {
//                 // Тестийн өмнө бүх хэрэглэгчдийг устгах
//                 userRepository.deleteAll();

//                 // Тест админ хэрэглэгч үүсгэх
//                 createAdminUser();

//                 // Админ хэрэглэгчээр нэвтэрч токен авах
//                 adminToken = loginAsAdmin();
//                 System.out.println("🔐 TOKEN: " + adminToken);

//         }

//         @AfterEach
//         void tearDown() {
//                 // Тестийн дараа бүх хэрэглэгчдийг устгах
//                 userRepository.deleteAll();
//         }

//         /**
//          * Тест админ хэрэглэгч үүсгэх
//          */
//         private void createAdminUser() {
//                 List<String> roles = new ArrayList<>();
//                 roles.add("ROLE_ADMIN");

//                 adminUser = User.builder()
//                                 .sisiId("admin")
//                                 .password(passwordEncoder.encode("admin123"))
//                                 .roles(roles)
//                                 .build();

//                 userRepository.save(adminUser);
//         }

//         /**
//          * Админ хэрэглэгчээр нэвтрэх
//          */
//         private String loginAsAdmin() throws Exception {
//                 AuthRequest authRequest = new AuthRequest();
//                 authRequest.setSisiId("admin");
//                 authRequest.setPassword("admin123");

//                 MvcResult result = mockMvc.perform(post("/auth/login")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(authRequest)))
//                                 .andExpect(status().isOk())
//                                 .andReturn();

//                 AuthResponse authResponse = objectMapper.readValue(
//                                 result.getResponse().getContentAsString(),
//                                 AuthResponse.class);

//                 return authResponse.getToken();
//         }

//         @Test
//         @DisplayName("Хэрэглэгч нэвтрэх")
//         void testLoginUser() throws Exception {
//                 // Эхлээд хэрэглэгч үүсгэх
//                 RegisterRequest registerRequest = new RegisterRequest();
//                 registerRequest.setSisiId("loginUser");
//                 registerRequest.setPassword("password123");

//                 mockMvc.perform(post("/auth/register")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(registerRequest)))
//                                 .andExpect(status().isOk());

//                 // Дараа нь хэрэглэгчээр нэвтрэх
//                 AuthRequest authRequest = new AuthRequest();
//                 authRequest.setSisiId("loginUser");
//                 authRequest.setPassword("password123");

//                 MvcResult result = mockMvc.perform(post("/auth/login")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(authRequest)))
//                                 .andExpect(status().isOk())
//                                 .andReturn();

//                 // Хариу шалгах
//                 AuthResponse response = objectMapper.readValue(
//                                 result.getResponse().getContentAsString(),
//                                 AuthResponse.class);

//                 assertNotNull(response);
//                 assertEquals("loginUser", response.getSisiId());
//                 assertNotNull(response.getToken());
//         }

//         @Test
//         @DisplayName("Буруу нууц үгээр нэвтрэх оролдлого")
//         void testLoginWithWrongPassword() throws Exception {
//                 // Эхлээд хэрэглэгч үүсгэх
//                 RegisterRequest registerRequest = new RegisterRequest();
//                 registerRequest.setSisiId("loginUserWrongPass");
//                 registerRequest.setPassword("password123");

//                 mockMvc.perform(post("/auth/register")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(registerRequest)))
//                                 .andExpect(status().isOk());

//                 // Буруу нууц үгээр нэвтрэх оролдлого
//                 AuthRequest authRequest = new AuthRequest();
//                 authRequest.setSisiId("loginUserWrongPass");
//                 authRequest.setPassword("wrongpassword");

//                 mockMvc.perform(post("/auth/login")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(authRequest)))
//                                 .andExpect(status().isUnauthorized());
//         }

//         @Test
//         @DisplayName("Байхгүй хэрэглэгчээр нэвтрэх оролдлого")
//         void testLoginWithNonExistingUser() throws Exception {
//                 // Байхгүй хэрэглэгчээр нэвтрэх оролдлого
//                 AuthRequest authRequest = new AuthRequest();
//                 authRequest.setSisiId("nonExistingUser");
//                 authRequest.setPassword("password123");

//                 mockMvc.perform(post("/auth/login")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(authRequest)))
//                                 .andExpect(status().isUnauthorized());
//         }

//         @Test
//         @DisplayName("Хоосон нэр нууц үгээр нэвтрэх оролдлого")
//         void testLoginWithEmptyCredentials() throws Exception {
//                 // Хоосон нэр нууц үгээр нэвтрэх
//                 AuthRequest authRequest = new AuthRequest();
//                 authRequest.setSisiId("");
//                 authRequest.setPassword("");

//                 mockMvc.perform(post("/auth/login")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(authRequest)))
//                                 .andExpect(status().isBadRequest());
//         }

//         @Test
//         @DisplayName("Логин амжилттай хийсний дараа токен хүчинтэй эсэх")
//         void testLoginTokenValidity() throws Exception {
//                 // Эхлээд хэрэглэгч үүсгэх
//                 RegisterRequest registerRequest = new RegisterRequest();
//                 registerRequest.setSisiId("tokenValidityUser");
//                 registerRequest.setPassword("password123");

//                 List<String> roles = new ArrayList<>();
//                 roles.add("ROLE_USER");
//                 registerRequest.setRoles(roles);

//                 mockMvc.perform(post("/auth/register")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(registerRequest)))
//                                 .andExpect(status().isOk());

//                 // Хэрэглэгчээр нэвтрэх
//                 AuthRequest authRequest = new AuthRequest();
//                 authRequest.setSisiId("tokenValidityUser");
//                 authRequest.setPassword("password123");

//                 MvcResult result = mockMvc.perform(post("/auth/login")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(authRequest)))
//                                 .andExpect(status().isOk())
//                                 .andReturn();

//                 // Авсан токеныг хадгалах
//                 AuthResponse response = objectMapper.readValue(
//                                 result.getResponse().getContentAsString(),
//                                 AuthResponse.class);

//                 String userToken = response.getToken();
//                 assertNotNull(userToken);

//                 // Токен ашиглан authorized endpoint руу хүсэлт илгээх
//                 mockMvc.perform(put("/auth/add-role")
//                                 .header("Authorization", "Bearer " + adminToken)
//                                 .param("sisiId", "tokenValidityUser")
//                                 .param("role", "ROLE_MANAGER"))
//                                 .andExpect(status().isOk());
//         }

//         @Test
//         @DisplayName("Админ хэрэглэгч хэрэглэгчид шинэ эрх нэмэх (addUserRole)")
//         void testAddUserRole() throws Exception {
//                 RegisterRequest registerRequest = new RegisterRequest();
//                 registerRequest.setSisiId("testUser1");
//                 registerRequest.setPassword("password123");

//                 mockMvc.perform(post("/auth/register")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(registerRequest)))
//                                 .andExpect(status().isOk());

//                 mockMvc.perform(put("/auth/add-role")
//                                 .header("Authorization", "Bearer " + adminToken)
//                                 .param("sisiId", "testUser1")
//                                 .param("role", "ROLE_DOCTOR"))
//                                 .andExpect(status().isOk());

//                 User updatedUser = userRepository.findBySisiId("testUser1").orElseThrow();
//                 assertNotNull(updatedUser);
//                 assertEquals(true, updatedUser.getRoles().contains("ROLE_DOCTOR"));
//         }

//         @Test
//         @DisplayName("Админ хэрэглэгч хэрэглэгчийн эрхүүдийг бүрэн шинэчлэх (updateUserRoles)")
//         void testUpdateUserRoles() throws Exception {
//                 RegisterRequest registerRequest = new RegisterRequest();
//                 registerRequest.setSisiId("testUser2");
//                 registerRequest.setPassword("password123");

//                 mockMvc.perform(post("/auth/register")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(registerRequest)))
//                                 .andExpect(status().isOk());

//                 UserRoleUpdateRequest updateRequest = new UserRoleUpdateRequest();
//                 updateRequest.setSisiId("testUser2");
//                 updateRequest.setRoles(List.of("ROLE_USER", "ROLE_DOCTOR"));

//                 mockMvc.perform(put("/auth/update-roles")
//                                 .header("Authorization", "Bearer " + adminToken)
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(updateRequest)))
//                                 .andExpect(status().isOk());

//                 User updatedUser = userRepository.findBySisiId("testUser2").orElseThrow();
//                 assertNotNull(updatedUser);
//                 assertEquals(2, updatedUser.getRoles().size());
//                 assertEquals(true, updatedUser.getRoles().contains("ROLE_USER"));
//                 assertEquals(true, updatedUser.getRoles().contains("ROLE_DOCTOR"));
//         }

// }
