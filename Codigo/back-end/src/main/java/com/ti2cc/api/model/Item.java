package com.ti2cc.api.model;

import java.time.LocalDate;
import java.util.UUID;

public class Item {
    private UUID id;
    private UUID categoryId;
    private UUID userId;
    private UUID accountId;
    private String name;
    private String description;
    private Double amount; 
    private LocalDate date;
    private ItemType type;

    public Item() {
        this(null, null, null, null, null, null, null, null, null);
    }

    public Item(UUID id, UUID categoryId, UUID userId, UUID accountId, String name, 
                String description, Double amount, LocalDate date, ItemType type) {
        this.id = id;
        this.categoryId = categoryId;
        this.userId = userId;
        this.accountId = accountId;
        this.name = name;
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.type = type;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
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

    public enum ItemType {
        income,
        expense
    }
}
