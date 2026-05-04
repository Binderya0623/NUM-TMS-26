package com.tms.thesissystem.domain.model;

public record User(
        Long id,
        UserRole role,
        String firstName,
        String lastName,
        String email,
        String departmentName,
        String program
) {
    public Long getId() { return id; }
    public UserRole getRole() { return role; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getDepartmentName() { return departmentName; }
    public String getProgram() { return program; }

    public String fullName() {
        return firstName + " " + lastName;
    }
}
