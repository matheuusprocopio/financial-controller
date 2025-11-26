package com.ti2cc.api.dto;

import java.util.UUID;

public class CategoryResponseDTO {
    private UUID id;
    private UUID userId;
    private String name;
    private String imagePath;
    private UUID mainCategoryId;
    private String createdAt;

    public CategoryResponseDTO() {
    }

    public CategoryResponseDTO(UUID id, UUID userId, String name, String imagePath, UUID mainCategoryId, String createdAt) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.imagePath = imagePath;
        this.mainCategoryId = mainCategoryId;
        this.createdAt = createdAt;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public UUID getMainCategoryId() {
        return mainCategoryId;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setMainCategoryId(UUID mainCategoryId) {
        this.mainCategoryId = mainCategoryId;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
