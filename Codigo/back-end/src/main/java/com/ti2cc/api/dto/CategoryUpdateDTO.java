package com.ti2cc.api.dto;

import java.util.UUID;

public class CategoryUpdateDTO {
    private String name;
    private String imagePath;
    private UUID mainCategoryId;

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
    public void setMainCategoryId(UUID mainCategoryId) {
        this.mainCategoryId = mainCategoryId;
    }
}