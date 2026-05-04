// import com.example.authservice.dto.AuthRequest;
// import com.example.authservice.dto.AuthResponse;
// import com.example.authservice.model.User;
// import com.example.authservice.repository.UserRepository;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.DisplayName;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import org.mockito.*;
// import org.mockito.junit.jupiter.MockitoExtension;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.BadCredentialsException;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.userdetails.UsernameNotFoundException;
// import org.springframework.test.util.ReflectionTestUtils;

// import java.util.List;
// import java.util.Optional;

// import static org.junit.jupiter.api.Assertions.*;
// import static org.mockito.Mockito.*;

// @ExtendWith(MockitoExtension.class)
// class UserServiceLoginTest {

//     @Mock AuthenticationManager authenticationManager;
//     @Mock UserRepository userRepository;
//     @Mock JwtService jwtService;
//     @InjectMocks UserService userService;

//     private AuthRequest authRequest;
//     private User testUser;

//     @BeforeEach
//     void setUp() {
//         ReflectionTestUtils.setField(userService, "authenticationManager", authenticationManager);

//         authRequest = new AuthRequest();
//         authRequest.setSisiId("testUser");
//         authRequest.setPassword("password");

//         testUser = User.builder()
//                 .id("1")
//                 .sisiId("testUser")
//                 .password("encodedPassword")
//                 .roles(List.of("ROLE_USER"))
//                 .build();
//     }

//     @Test
//     @DisplayName("login() — Амжилттай нэвтрэх")
//     void loginSuccess() {
//         when(userRepository.findBySisiId("testUser"))
//             .thenReturn(Optional.of(testUser));
//         when(jwtService.generateToken(testUser, testUser.getRoles()))
//             .thenReturn("jwt-token");

//         AuthResponse resp = userService.login(authRequest);

//         // assert
//         assertEquals("1", resp.getId());
//         assertEquals("testUser", resp.getSisiId());
//         assertEquals("jwt-token", resp.getToken());
//         assertEquals(testUser.getRoles(), resp.getRoles());
//         verify(authenticationManager)
//             .authenticate(any(UsernamePasswordAuthenticationToken.class));
//     }

//     @Test
//     @DisplayName("login() — Буруу нэвтрэх (AuthenticationException)")
//     void loginBadCredentials() {
//         doThrow(new BadCredentialsException("bad creds"))
//             .when(authenticationManager)
//             .authenticate(any());

//         RuntimeException ex = assertThrows(RuntimeException.class,
//             () -> userService.login(authRequest));
//         assertTrue(ex.getMessage().contains("нууц үг буруу"));
//     }

//     @Test
//     @DisplayName("login() — Хэрэглэгч олдсонгүй")
//     void loginUserNotFound() {
//         when(userRepository.findBySisiId("testUser"))
//             .thenReturn(Optional.empty());

//         assertThrows(UsernameNotFoundException.class,
//             () -> userService.login(authRequest));
//     }
// }

