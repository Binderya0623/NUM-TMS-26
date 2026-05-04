package mn.num.edu.workflow_service.domain.utils;


import mn.num.edu.workflow_service.domain.model.WorkflowStage;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

public class WorkflowStageUtils {

    public static Optional<WorkflowStage> findNextStage(List<WorkflowStage> stages, WorkflowStage current) {
        List<WorkflowStage> sorted = stages.stream()
                .sorted(Comparator.comparing(WorkflowStage::getStartDate))
                .toList();

        for (int i = 0; i < sorted.size(); i++) {
            if (sorted.get(i).getId().equals(current.getId())) {
                if (i + 1 < sorted.size()) {
                    return Optional.of(sorted.get(i + 1));
                }
            }
        }
        return Optional.empty();
    }
}