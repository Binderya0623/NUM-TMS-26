package com.tms.thesissystem.domain.model;

public record WeeklyTask(
        int week,
        String title,
        String deliverable,
        String focus
) {
}
