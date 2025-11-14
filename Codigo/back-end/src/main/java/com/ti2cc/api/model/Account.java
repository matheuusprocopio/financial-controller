package com.ti2cc.api.model;

import java.util.UUID;

public class Account {
    private UUID id;
    private String name;
    private UUID userId;
    private String financialInstitution;
    private Double balance;

    public Account() {
        this(null, null, null, null, 0.0);
    }

    public Account(UUID id, String name, UUID userId, String financialInstitution, double balance) {
        this.id = id;
        this.name = name;
        this.userId = userId;
        this.financialInstitution = financialInstitution;
        this.balance = balance;
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
}
