package com.ti2cc.api.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class Goal {
    private UUID id;
    private UUID userId;
    private UUID accountId;
    private String title;
    private String description;
    private Double targetAmount;
    private Double currentAmount;
    private LocalDate deadline;
    private boolean achieved;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private transient float[] searchEmbedding;

    public Goal() {
        this(null, null, null, null, null, null, null, null, false, null, null, null);
    }

    public Goal(UUID id, UUID userId, UUID accountId, String title, String description,
                Double targetAmount, Double currentAmount, LocalDate deadline, boolean achieved,
                OffsetDateTime createdAt, OffsetDateTime updatedAt, float[] searchEmbedding) {
        this.id = id;
        this.userId = userId;
        this.accountId = accountId;
        this.title = title;
        this.description = description;
        this.targetAmount = targetAmount;
        this.currentAmount = currentAmount;
        this.deadline = deadline;
        this.achieved = achieved;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.searchEmbedding = searchEmbedding;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getAccountId() {
        return accountId;
    }

    public void setAccountId(UUID accountId) {
        this.accountId = accountId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(Double targetAmount) {
        this.targetAmount = targetAmount;
    }

    public Double getCurrentAmount() {
        return currentAmount;
    }

    public void setCurrentAmount(Double currentAmount) {
        this.currentAmount = currentAmount;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public boolean isAchieved() {
        return achieved;
    }

    public void setAchieved(boolean achieved) {
        this.achieved = achieved;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public float[] getSearchEmbedding() {
        return searchEmbedding;
    }

    public void setSearchEmbedding(float[] searchEmbedding) {
        this.searchEmbedding = searchEmbedding;
    }
}
