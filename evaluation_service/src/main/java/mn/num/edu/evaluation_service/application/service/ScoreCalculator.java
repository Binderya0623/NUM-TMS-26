package mn.num.edu.evaluation_service.application.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class ScoreCalculator {

    public BigDecimal weightedScore(BigDecimal maxPoint, int percent) {
        if (percent < 0 || percent > 100) {
            throw new IllegalArgumentException("Percent must be between 0 and 100");
        }
        return maxPoint
                .multiply(BigDecimal.valueOf(percent))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }
}
