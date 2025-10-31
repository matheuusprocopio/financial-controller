package com.ti2cc.api.dto;

import java.time.LocalDate;

public class DateRangeDTO {

    public static final LocalDate DEFAULT_START_DATE = LocalDate.of(1970, 1, 1);
    public static final LocalDate DEFAULT_END_DATE = LocalDate.now();

    private final LocalDate startDate;
    private final LocalDate endDate;

    public DateRangeDTO(LocalDate startDate, LocalDate endDate) {
        LocalDate resolvedStart = startDate != null ? startDate : DEFAULT_START_DATE;
        LocalDate resolvedEnd = endDate != null ? endDate : DEFAULT_END_DATE;

        if (resolvedEnd.isBefore(resolvedStart)) {
            resolvedEnd = resolvedStart;
        }

        this.startDate = resolvedStart;
        this.endDate = resolvedEnd;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }
}
