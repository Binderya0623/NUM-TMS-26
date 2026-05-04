package com.tms.thesissystem.domain.model;

import java.time.LocalDateTime;

public record Review(
        Long id,
        Long planId,
        int week,
        Long reviewerId,
        String reviewerName,
        int score,
        String comment,
        LocalDateTime createdAt
) {
}
