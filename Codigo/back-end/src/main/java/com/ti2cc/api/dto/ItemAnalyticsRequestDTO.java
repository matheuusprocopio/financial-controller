package com.ti2cc.api.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ItemAnalyticsRequestDTO {

    public enum Metric {
        total_expenses,
        total_incomes,
        balance,
        count_items
    }

    public enum GroupBy {
        month,
        category,
        account,
        type
    }

    private UUID userId;
    private Metric metric;
    private List<GroupBy> groupBy;
    private LocalDate startDate;
    private LocalDate endDate;
    private UUID categoryId;
    private UUID accountId;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public Metric getMetric() {
        return metric;
    }

    public void setMetric(Metric metric) {
        this.metric = metric;
    }

    public List<GroupBy> getGroupBy() {
        return groupBy;
    }

    public void setGroupBy(List<GroupBy> groupBy) {
        this.groupBy = groupBy;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
    }

    public UUID getAccountId() {
        return accountId;
    }

    public void setAccountId(UUID accountId) {
        this.accountId = accountId;
    }
}
