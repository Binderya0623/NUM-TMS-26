package mn.num.edu.committee_service.domain.model;

public enum CommitteeRole {
    MEMBER,
    HEAD,
    SENIOR,    // kept for backward compat; treated as HEAD at runtime
    SECRETARY,
    EXTERNAL_EXPERT
}