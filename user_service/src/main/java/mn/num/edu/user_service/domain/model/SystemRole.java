package mn.num.edu.user_service.domain.model;

/**
 * Must stay in lock-step with the {@code chk_system_role} CHECK constraint
 * in {@code schema_user_service.sql}. Any value present in the DB but absent
 * from the enum makes Spring Data fail to deserialize the row, so the user
 * disappears from every {@code findById} / list endpoint without any error
 * surfacing to the caller.
 */
public enum SystemRole {

    ADMIN,
    STUDENT,
    TEACHER,
    EXTERNAL_EXPERT,
    DEPARTMENT_HEAD

}