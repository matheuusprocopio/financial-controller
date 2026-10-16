package com.ti2cc.api.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.ti2cc.api.dao.CategoryDAO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Category;

public class CategoryService {
    private final CategoryDAO categoryDAO;
    private final EmbeddingService embeddingService;

    public CategoryService(CategoryDAO categoryDAO, EmbeddingService embeddingService) {
        this.categoryDAO = categoryDAO;
        this.embeddingService = embeddingService;
    }

    public boolean createCategory(Category category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            System.err.println("Category name cannot be empty.");
            return false;
        }

        if (category.getId() == null) {
            category.setId(UUID.randomUUID());
        }

        if (category.getCreatedAt() == null) {
            category.setCreatedAt(OffsetDateTime.now());
        }

        float[] embedding = embeddingService.generateEmbedding(category.getName());
        if (embedding == null) {
            System.err.println("Failed to generate embedding for category creation. Saving without it; semantic search will rank it last.");
        }
        category.setSearchEmbedding(embedding);

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

        if (category.getName() != null && !category.getName().trim().isEmpty()) {
            float[] embedding = embeddingService.generateEmbedding(category.getName());
            if (embedding == null) {
                System.err.println("Failed to generate embedding for category update. Keeping the previous embedding.");
            }
            category.setSearchEmbedding(embedding);
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

    public List<Category> listCategories(UUID userId, String name, UUID mainCategoryId, String semanticQuery) {
        if (userId == null) {
            System.err.println("Invalid user ID.");
            return List.of();
        }

        if (semanticQuery != null && !semanticQuery.isBlank()) {
            float[] embedding = embeddingService.generateEmbedding(semanticQuery);
            if (embedding != null) {
                return categoryDAO.getBySemanticSearch(userId, embedding, mainCategoryId);
            }
            System.err.println("Failed to generate embedding for semantic category search. Falling back to regular listing.");
        }

        return categoryDAO.getByFilters(userId, name, mainCategoryId);
    }

    public PaginatedResponseDTO<Category> listCategoriesPaginated(UUID userId, String name, UUID mainCategoryId, String semanticQuery, PaginationRequestDTO pagination) {
        if (userId == null) {
            System.err.println("Invalid user ID.");
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        if (semanticQuery != null && !semanticQuery.isBlank()) {
            float[] embedding = embeddingService.generateEmbedding(semanticQuery);
            if (embedding != null) {
                List<Category> categories = categoryDAO.getBySemanticSearchPaginated(userId, embedding, mainCategoryId, pagination.getOffset(), pagination.getPageLimit());
                long totalItems = categoryDAO.countWithEmbedding(userId, mainCategoryId);

                return new PaginatedResponseDTO<>(categories, totalItems, pagination.getPage(), pagination.getPageLimit());
            }
            System.err.println("Failed to generate embedding for semantic category search (paginated). Falling back to regular listing.");
        }

        List<Category> categories = categoryDAO.getByFiltersPaginated(userId, name, mainCategoryId, pagination.getOffset(), pagination.getPageLimit());
        long totalItems = categoryDAO.countByFilters(userId, name, mainCategoryId);

        return new PaginatedResponseDTO<>(categories, totalItems, pagination.getPage(), pagination.getPageLimit());
    }
}
