package com.ti2cc.api.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.ti2cc.api.model.Item.ItemType;

public class ItemResponseDTO {
    private UUID id;
    private UUID categoryId;
    private UUID userId;
    private UUID accountId;
    private String name;
    private String description;
    private Double amount;
    private LocalDate date;
    private ItemType type;

    public ItemResponseDTO(UUID id, UUID categoryId, UUID userId, UUID accountId, String name, String description, Double amount, LocalDate date, ItemType type) {
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

    public UUID getCategoryId() {
        return categoryId;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getAccountId() {
        return accountId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Double getAmount() {
        return amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public ItemType getType() {
        return type;
    }
}
