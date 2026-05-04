package com.example.authservice.integration;

//import com.example.authservice.dto.AuthResponse;
import com.example.authservice.dto.RegisterRequest;
import com.example.authservice.model.User;
import com.example.authservice.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserRegistrationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
    }

    // @Test
    // @DisplayName("Давхардсан хэрэглэгч бүртгэх үед алдаа гарах тест")
    // void testDuplicateUserRegistration() throws Exception {
    //     // Эхний хэрэглэгчийг бүртгэх
    //     RegisterRequest registerRequest1 = new RegisterRequest();
    //     registerRequest1.setSisiId("22B1NUM5555");
    //     registerRequest1.setPassword("22B1NUM5555");
    //     List<String> roles1 = new ArrayList<>();
    //     roles1.add("ROLE_USER");
    //     registerRequest1.setRoles(roles1);

    //     mockMvc.perform(post("/auth/register")
    //             .contentType(MediaType.APPLICATION_JSON)
    //             .content(objectMapper.writeValueAsString(registerRequest1)))
    //             .andExpect(status().isOk());

    //     // Давхардсан sisiId-тай хэрэглэгчийг бүртгэх оролдлого
    //     RegisterRequest registerRequest2 = new RegisterRequest();
    //     registerRequest2.setSisiId("22B1NUM5555");
    //     registerRequest2.setPassword("22B1NUM6666"); // Өөр нууц үг
    //     List<String> roles2 = new ArrayList<>();
    //     roles2.add("ROLE_USER");
    //     registerRequest2.setRoles(roles2);

    //     mockMvc.perform(post("/auth/register")
    //             .contentType(MediaType.APPLICATION_JSON)
    //             .content(objectMapper.writeValueAsString(registerRequest2)))
    //             .andExpect(status().isBadRequest()); // Энд алдаа гарна гэж шалгаж байна

    //     // Баталгаажуулалт: Хэрэглэгч зөвхөн нэг л удаа бүртгэгдсэн эсэх
    //     long count = userRepository.count();
    //     assertEquals(1, count, "Хэрэглэгчийн тоо 1-ээс их байж болохгүй");

    //     User savedUser = userRepository.findBySisiId("22B1NUM5555").orElse(null);
    //     assertNotNull(savedUser, "Хэрэглэгч олдсонгүй");
    //     assertEquals("22B1NUM5555", savedUser.getSisiId());
    //     assertEquals("22B1NUM5555", savedUser.getPassword());
    //     assertTrue(savedUser.getRoles().contains("ROLE_USER"));
    // }

    @Test
    @DisplayName("Хоосон sisiId-тай хэрэглэгч бүртгэх үед алдаа гарах тест")
    void testRegisterUserWithEmptySisiId() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setSisiId("");
        registerRequest.setPassword("password123");
        registerRequest.setRoles(List.of("ROLE_USER"));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());
    }

    // @Test
    // @DisplayName("Хоосон нууц үгтэй хэрэглэгч бүртгэх үед алдаа гарах тест")
    // void testRegisterUserWithEmptyPassword() throws Exception {
    //     RegisterRequest registerRequest = new RegisterRequest();
    //     registerRequest.setSisiId("22B1NUM7777");
    //     registerRequest.setPassword("");
    //     registerRequest.setRoles(List.of("ROLE_USER"));

    //     mockMvc.perform(post("/auth/register")
    //                     .contentType(MediaType.APPLICATION_JSON)
    //                     .content(objectMapper.writeValueAsString(registerRequest)))
    //             .andExpect(status().isBadRequest());
    // }

    // @Test
    // @DisplayName("Бүртгэлийн хүсэлтэнд role байхгүй үед алдаа гарах тест")
    // void testRegisterUserWithoutRoles() throws Exception {
    //     RegisterRequest registerRequest = new RegisterRequest();
    //     registerRequest.setSisiId("22B1NUM8888");
    //     registerRequest.setPassword("password123");
    //     registerRequest.setRoles(new ArrayList<>());

    //     mockMvc.perform(post("/auth/register")
    //                     .contentType(MediaType.APPLICATION_JSON)
    //                     .content(objectMapper.writeValueAsString(registerRequest)))
    //             .andExpect(status().isBadRequest());
    // }

    // @Test
    // @DisplayName("Хэрэглэгчийн бүртгэлийн sisiId-н урт хэтэрсэн үед алдаа гарах тест")
    // void testRegisterUserWithLongSisiId() throws Exception {
    //     RegisterRequest registerRequest = new RegisterRequest();
    //     registerRequest.setSisiId("22B1NUM999999999999999"); // Length exceeds limit
    //     registerRequest.setPassword("password123");
    //     registerRequest.setRoles(List.of("ROLE_USER"));

    //     mockMvc.perform(post("/auth/register")
    //                     .contentType(MediaType.APPLICATION_JSON)
    //                     .content(objectMapper.writeValueAsString(registerRequest)))
    //             .andExpect(status().isBadRequest());
    // }


        @Test
        @DisplayName("Шинэ хэрэглэгч бүртгэх тест")
        void testUserRegistration() throws Exception {
        String sisiId = "22B1NUM4444";

        boolean existsBefore = userRepository.existsBySisiId(sisiId);

        assertFalse(existsBefore);

        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setSisiId(sisiId);
        registerRequest.setPassword("22B1NUM4444");
        registerRequest.setRoles(List.of("ROLE_USER"));

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
            .andExpect(status().isOk());

        boolean existsAfter = userRepository.existsBySisiId(sisiId);

            assertTrue(existsAfter);
        }

        // @Test
        // @DisplayName("Давхардсан хэрэглэгч бүртгэх үед алдаа гарах тест - регистр case өөр үед")
        
        // void testDuplicateUserRegistrationDifferentCase() throws Exception {
        // // Эхний хэрэглэгчийг бүртгэх
        // RegisterRequest registerRequest1 = new RegisterRequest();
        // registerRequest1.setSisiId("22B1NUM5555");
        // registerRequest1.setPassword("22B1NUM5555");
        // List<String> roles1 = new ArrayList<>();
        // roles1.add("ROLE_USER");
        // registerRequest1.setRoles(roles1);

        // mockMvc.perform(post("/auth/register")
        //         .contentType(MediaType.APPLICATION_JSON)
        //         .content(objectMapper.writeValueAsString(registerRequest1)))
        //     .andExpect(status().isOk());

        // // Давхардсан sisiId-тай хэрэглэгчийг бүртгэх оролдлого (case өөр)
        // RegisterRequest registerRequest2 = new RegisterRequest();
        // registerRequest2.setSisiId("22b1NUM5555"); // lowercase sisiId
        // registerRequest2.setPassword("22B1NUM6666"); // Өөр нууц үг
        // List<String> roles2 = new ArrayList<>();
        // roles2.add("ROLE_USER");
        // registerRequest2.setRoles(roles2);

        // mockMvc.perform(post("/auth/register")
        //         .contentType(MediaType.APPLICATION_JSON)
        //         .content(objectMapper.writeValueAsString(registerRequest2)))
        //     .andExpect(status().isBadRequest()); // Энд алдаа гарна гэж шалгаж байна

        // // Баталгаажуулалт: Хэрэглэгч зөвхөн нэг л удаа бүртгэгдсэн эсэх
        // long count = userRepository.count();
        // assertEquals(1, count, "Хэрэглэгчийн тоо 1-ээс их байж болохгүй");

        // User savedUser = userRepository.findBySisiId("22B1NUM5555").orElse(null);
        // assertNotNull(savedUser, "Хэрэглэгч олдсонгүй");
        // assertEquals("22B1NUM5555", savedUser.getSisiId());
        // assertEquals("22B1NUM5555", savedUser.getPassword());
        // assertTrue(savedUser.getRoles().contains("ROLE_USER"));
        // }

    @Test
    @DisplayName("Null sisiId-тай хэрэглэгч бүртгэх үед алдаа гарах тест")
    void testRegisterUserWithNullSisiId() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setSisiId(null);
        registerRequest.setPassword("password123");
        registerRequest.setRoles(List.of("ROLE_USER"));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());
    }


}