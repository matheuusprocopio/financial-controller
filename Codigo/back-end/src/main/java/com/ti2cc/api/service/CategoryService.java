package com.ti2cc.api.service;

import java.util.List;
import java.util.UUID;

import com.ti2cc.api.dao.CategoryDAO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Category;

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

        if (category.getId() == null) {
            category.setId(UUID.randomUUID());
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

    public List<Category> listCategories(UUID userId, String name, UUID mainCategoryId) {
        if (userId == null) {
            System.err.println("Invalid user ID.");
            return List.of();
        }

        return categoryDAO.getByFilters(userId, name, mainCategoryId);
    }

    public PaginatedResponseDTO<Category> listCategoriesPaginated(UUID userId, String name, UUID mainCategoryId, PaginationRequestDTO pagination) {
        if (userId == null) {
            System.err.println("Invalid user ID.");
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        List<Category> categories = categoryDAO.getByFiltersPaginated(userId, name, mainCategoryId, pagination.getOffset(), pagination.getPageLimit());
        long totalItems = categoryDAO.countByFilters(userId, name, mainCategoryId);

        return new PaginatedResponseDTO<>(categories, totalItems, pagination.getPage(), pagination.getPageLimit());
    }
}
