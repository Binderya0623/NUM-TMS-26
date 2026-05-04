package com.example.authservice.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    

        

    //  1. Админ хэрэглэгч бусдыг устгах тест
//    @Test
//    void adminCanDeleteUser() throws Exception {
//        String userIdToDelete = "67f551cb85f8f1683cc226a9";

//        mockMvc.perform(delete("/auth/users/{id}", userIdToDelete)
//                .header("X-User-ID", "admin01")
//                .header("X-User-Roles", "ROLE_ADMIN")
//                .with(csrf()))
//            .andExpect(status().isNoContent());
//    }

    //  2. Админ хэрэглэгч бусдаас эрх хасах тест
    @Test
    void adminCanRemoveUserRole() throws Exception {
        mockMvc.perform(put("/auth/remove-role")
                .param("sisiId", "user01")
                .param("role", "ROLE_DOCTOR")
                .header("X-User-ID", "admin01")
                .header("X-User-Roles", "ROLE_ADMIN")
                .with(csrf()))
            .andExpect(status().isOk());
    }

    //  3. Админ биш хэрэглэгч эрх хасах оролдлого (Access Denied)
    @Test
    void nonAdminCannotRemoveUserRole() throws Exception {
        mockMvc.perform(put("/auth/remove-role")
                .param("sisiId", "user01")
                .param("role", "ROLE_DOCTOR")
                .header("X-User-ID", "user01")
                .header("X-User-Roles", "ROLE_USER")
                .with(csrf()))
            .andExpect(status().isForbidden());
    }

    //  4. Админ биш хэрэглэгч хэрэглэгч устгах оролдлого (Access Denied)
    @Test
    void nonAdminCannotDeleteUser() throws Exception {
        String userIdToDelete = "680599f2572fc93454da9e88";

        mockMvc.perform(delete("/auth/users/{id}", userIdToDelete)
                .header("X-User-ID", "user01")
                .header("X-User-Roles", "ROLE_USER")
                .with(csrf()))
            .andExpect(status().isForbidden());
    }
}
