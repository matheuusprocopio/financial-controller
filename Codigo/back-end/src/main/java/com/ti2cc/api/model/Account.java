package com.ti2cc.api.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class Account {
    private UUID id;
    private String name;
    private UUID userId;
    private String financialInstitution;
    private Double balance;
    private OffsetDateTime createdAt;
    private transient float[] searchEmbedding;

    public Account() {
        this(null, null, null, null, 0.0, null, null);
    }

    public Account(UUID id, String name, UUID userId, String financialInstitution, double balance, OffsetDateTime createdAt, float[] searchEmbedding) {
        this.id = id;
        this.name = name;
        this.userId = userId;
        this.financialInstitution = financialInstitution;
        this.balance = balance;
        this.createdAt = createdAt;
        this.searchEmbedding = searchEmbedding;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getFinancialInstitution() {
        return financialInstitution;
    }

    public void setFinancialInstitution(String financialInstitution) {
        this.financialInstitution = financialInstitution;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public float[] getSearchEmbedding() {
        return searchEmbedding;
    }

    public void setSearchEmbedding(float[] searchEmbedding) {
        this.searchEmbedding = searchEmbedding;
    }
}
