package com.ti2cc.api.service;

import com.ti2cc.api.dao.CategoryDAO;
import com.ti2cc.api.model.Category;

import java.util.List;
import java.util.UUID;

public class CategoryService {
    private final CategoryDAO categoryDAO;

    public CategoryService(CategoryDAO categoryDAO) {
        this.categoryDAO = categoryDAO;
    }

    public boolean createCategory(Category category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            System.err.println("Category name cannot be empty.");
            return false;
        }

        return categoryDAO.create(category);
    }

    public boolean updateCategory(Category category) {
        if (category.getId() == null) {
            System.err.println("Invalid category ID.");
            return false;
        }

        if (category.getName() == null &&
                category.getImagePath() == null &&
                category.getMainCategoryId() == null) {
            System.err.println("No fields to update for category ID: " + category.getId());
            return false;
        }

        return categoryDAO.update(category);
    }

    public boolean deleteCategory(UUID id) {
        if (id == null) {
            System.err.println("Invalid category ID for deletion.");
            return false;
        }

        return categoryDAO.delete(id);
    }

    public Category findCategoryById(UUID id) {
        if (id == null) {
            System.err.println("Invalid category ID.");
            return null;
        }

        return categoryDAO.getById(id);
    }

    public List<Category> listAllCategories() {
        return categoryDAO.getAll();
    }
}
