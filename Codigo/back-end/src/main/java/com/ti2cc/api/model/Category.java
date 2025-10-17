package com.ti2cc.api.model;

public class Category {
    private int id;
    private int userId;
    private String name;
    private String imagePath;
    private Integer mainCategoryId;

    public Category() {
        this(0, 0, null, null, null);
    }

    public Category(int id, int userId,String name, String imagePath, Integer mainCategoryId) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.imagePath = imagePath;
        this.mainCategoryId = mainCategoryId;
    }


    public int getId() {
        return id;
    }

    public int getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getImagePath() {
        return imagePath;
    }

    public Integer getMainCategoryId() {
        return mainCategoryId;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public void setMainCategoryId(Integer mainCategoryId) {
        this.mainCategoryId = mainCategoryId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }
}