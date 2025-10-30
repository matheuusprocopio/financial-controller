package com.ti2cc.api.model;

import java.util.UUID;

public class Category {
    private UUID id;
    private UUID userId;
    private String name;
    private String imagePath;
    private UUID mainCategoryId;

    public Category() {
        this(null, null, null, null, null);
    }

    public Category(UUID id, UUID userId, String name, String imagePath, UUID mainCategoryId) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.imagePath = imagePath;
        this.mainCategoryId = mainCategoryId;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getImagePath() {
        return imagePath;
    }

    public UUID getMainCategoryId() {
        return mainCategoryId;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public void setMainCategoryId(UUID mainCategoryId) {
        this.mainCategoryId = mainCategoryId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }
}
