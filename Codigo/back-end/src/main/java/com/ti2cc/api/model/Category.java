package com.ti2cc.api.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class Category {
    private UUID id;
    private UUID userId;
    private String name;
    private String imagePath;
    private UUID mainCategoryId;
    private OffsetDateTime createdAt;
    private transient float[] searchEmbedding;

    public Category() {
        this(null, null, null, null, null, null, null);
    }

    public Category(UUID id, UUID userId, String name, String imagePath, UUID mainCategoryId, OffsetDateTime createdAt, float[] searchEmbedding) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.imagePath = imagePath;
        this.mainCategoryId = mainCategoryId;
        this.createdAt = createdAt;
        this.searchEmbedding = searchEmbedding;
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

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public float[] getSearchEmbedding() {
        return searchEmbedding;
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

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public void setSearchEmbedding(float[] searchEmbedding) {
        this.searchEmbedding = searchEmbedding;
    }
}
