package mn.num.edu.committee_service.adapter.in.web.request;

import mn.num.edu.committee_service.domain.model.CommitteeRole;

public record AssignTeacherRequest(
        String teacherId,
        CommitteeRole role,
        String departmentId
) {

}