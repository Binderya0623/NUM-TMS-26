package com.tms.thesissystem.application.service;

import com.tms.thesissystem.api.ApiDtos;
import com.tms.thesissystem.domain.model.User;
import com.tms.thesissystem.domain.model.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.List;

@Service
public class AuthService {
    private final WorkflowQueryService queryService;
    private final String defaultPassword;

    public AuthService(WorkflowQueryService queryService,
                       @Value("${app.auth.default-password:123456}") String defaultPassword) {
        this.queryService = queryService;
        this.defaultPassword = defaultPassword;
    }

    public ApiDtos.LoginResponse login(String username, String password) {
        String normalizedUsername = normalize(username);
        String normalizedPassword = password == null ? "" : password;

        if (normalizedUsername.isBlank() || normalizedPassword.isBlank()) {
            return new ApiDtos.LoginResponse(false, "Нэвтрэх нэр болон нууц үгээ оруулна уу.", null);
        }

        if (!defaultPassword.equals(normalizedPassword)) {
            return new ApiDtos.LoginResponse(false, "Нэвтрэх нэр эсвэл нууц үг буруу байна.", null);
        }

        List<User> users = queryService.getDashboard().users();

        Optional<User> matchedUser = users.stream()
                .filter(user -> candidateUsernames(user).contains(normalizedUsername))
                .findFirst();

        if (matchedUser.isEmpty()) {
            matchedUser = demoAliasMatch(users, normalizedUsername);
        }

        if (matchedUser.isEmpty()) {
            return new ApiDtos.LoginResponse(false, "Нэвтрэх нэр эсвэл нууц үг буруу байна.", null);
        }

        User user = matchedUser.orElseThrow();
        ApiDtos.AuthUserDto authUser = new ApiDtos.AuthUserDto(
                user.id(),
                normalizedUsername,
                user.fullName(),
                toFrontendRole(user.role())
        );
        return new ApiDtos.LoginResponse(true, "Амжилттай нэвтэрлээ.", authUser);
    }

    private Optional<User> demoAliasMatch(List<User> users, String username) {
        List<String> studentAliases = List.of("anu", "temuulen", "nomin");
        List<String> teacherAliases = List.of("enkh", "bolor", "saruul");
        List<String> departmentAliases = List.of("se-dept");

        int studentIndex = studentAliases.indexOf(username);
        if (studentIndex >= 0) {
            return users.stream().filter(user -> user.role() == UserRole.STUDENT).skip(studentIndex).findFirst();
        }

        int teacherIndex = teacherAliases.indexOf(username);
        if (teacherIndex >= 0) {
            return users.stream().filter(user -> user.role() == UserRole.TEACHER).skip(teacherIndex).findFirst();
        }

        int departmentIndex = departmentAliases.indexOf(username);
        if (departmentIndex >= 0) {
            return users.stream().filter(user -> user.role() == UserRole.DEPARTMENT).skip(departmentIndex).findFirst();
        }

        return Optional.empty();
    }

    private Set<String> candidateUsernames(User user) {
        Set<String> usernames = new LinkedHashSet<>();
        if (user.email() != null && user.email().contains("@")) {
            usernames.add(normalize(user.email().substring(0, user.email().indexOf('@'))));
        }
        usernames.add(normalize(user.firstName()));
        usernames.add(normalize(user.fullName()));
        if (user.fullName() != null && !user.fullName().isBlank()) {
            usernames.add(normalize(user.fullName().split("\\s+")[0]));
        }
        if (user.role() == UserRole.DEPARTMENT) {
            String department = normalize(user.departmentName());
            usernames.add(department.replace(" ", "-") + "-dept");
            usernames.add(initials(user.departmentName()) + "-dept");
            if (department.contains("software engineering")) {
                usernames.add("se-dept");
            }
        }
        return usernames;
    }

    private String initials(String value) {
        if (value == null || value.isBlank()) {
            return "dept";
        }
        StringBuilder builder = new StringBuilder();
        for (String part : value.trim().split("\\s+")) {
            if (!part.isBlank()) {
                builder.append(Character.toLowerCase(part.charAt(0)));
            }
        }
        return builder.toString();
    }

    private String toFrontendRole(UserRole role) {
        return role.name().toLowerCase(Locale.ROOT);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
