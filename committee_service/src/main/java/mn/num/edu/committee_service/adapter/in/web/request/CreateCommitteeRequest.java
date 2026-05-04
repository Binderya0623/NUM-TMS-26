package mn.num.edu.committee_service.adapter.in.web.request;

import com.fasterxml.jackson.annotation.JsonAlias;

public record CreateCommitteeRequest(
        String departmentId,
        String name,
        @JsonAlias("stageType") String defenseType
) {}
