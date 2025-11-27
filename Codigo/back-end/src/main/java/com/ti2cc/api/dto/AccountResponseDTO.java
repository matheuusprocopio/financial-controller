package com.ti2cc.api.dto;

import java.util.UUID;

public class AccountResponseDTO {
    private UUID id;
    private String name;
    private UUID userId;
    private String financialInstitution;
    private Double balance;
    private String createdAt;

    public AccountResponseDTO(UUID id, String name, UUID userId, String financialInstitution, Double balance, String createdAt) {
        this.id = id;
        this.name = name;
        this.userId = userId;
        this.financialInstitution = financialInstitution;
        this.balance = balance;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getFinancialInstitution() {
        return financialInstitution;
    }

    public Double getBalance() {
        return balance;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}
