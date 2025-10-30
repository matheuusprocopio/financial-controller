package com.ti2cc.api.controller;

import com.google.gson.Gson;
import com.ti2cc.api.model.Category;
import com.ti2cc.api.service.CategoryService;

import java.util.UUID;

public class CategoryController {

    private final CategoryService categoryService;
    private final Gson gson = new Gson();

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    public String create(String body) {
        Category category = gson.fromJson(body, Category.class);
        boolean created = categoryService.createCategory(category);

        if (created) {
            return gson.toJson(category);
        } else {
            return gson.toJson("Failed to create category.");
        }
    }

    public String getAll() {
        return gson.toJson(categoryService.listAllCategories());
    }

    public String getById(String idStr) {
        try {
            UUID id = UUID.fromString(idStr);
            Category category = categoryService.findCategoryById(id);

            if (category != null) {
                return gson.toJson(category);
            } else {
                return gson.toJson("Category not found.");
            }
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid ID format.");
        }
    }

    public String update(String idStr, String body) {
        try {
            UUID id = UUID.fromString(idStr);
            Category category = gson.fromJson(body, Category.class);
            category.setId(id);

            boolean updated = categoryService.updateCategory(category);
            if (updated) {
                return gson.toJson("Category updated successfully.");
            } else {
                return gson.toJson("Failed to update category.");
            }
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid ID format.");
        }
    }

    public String delete(String idStr) {
        try {
            UUID id = UUID.fromString(idStr);
            boolean deleted = categoryService.deleteCategory(id);

            if (deleted) {
                return gson.toJson("Category deleted successfully.");
            } else {
                return gson.toJson("Category not found.");
            }
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid ID format.");
        }
    }
}
