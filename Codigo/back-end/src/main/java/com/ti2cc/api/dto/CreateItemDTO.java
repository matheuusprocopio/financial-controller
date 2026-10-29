package com.ti2cc.api.dto;

import java.time.LocalDate;

import com.ti2cc.api.model.Item.ItemType;

public class CreateItemDTO {
    private String categoryId;
    private String accountId;
    private String name;
    private String description;
    private Double amount;
    private LocalDate date;
    private ItemType type;
    private boolean duplicateConfirmed;

    public boolean isDuplicateConfirmed() { return duplicateConfirmed; }
    public void setDuplicateConfirmed(boolean duplicateConfirmed) { this.duplicateConfirmed = duplicateConfirmed; }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public ItemType getType() {
        return type;
    }

    public void setType(ItemType type) {
        this.type = type;
    }
}
