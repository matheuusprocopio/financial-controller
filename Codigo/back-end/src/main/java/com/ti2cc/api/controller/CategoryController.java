package com.ti2cc.api.controller;

import java.util.List;
import java.util.UUID;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.ti2cc.api.dto.CategoryResponseDTO;
import com.ti2cc.api.dto.CategoryUpdateDTO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Category;
import com.ti2cc.api.model.User;
import com.ti2cc.api.service.CategoryService;

import spark.Request;
import spark.Response;

public class CategoryController {

    private final CategoryService categoryService;
    private final Gson gson = new Gson();

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    public Object create(Request req, Response res) {
        res.type("application/json");
        try {
            User sessionUser = req.attribute("user");
            if (sessionUser == null || sessionUser.getId() == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }

            Category category = gson.fromJson(req.body(), Category.class);
            if (category == null) {
                res.status(400);
                return gson.toJson("Request body is required.");
            }
            category.setUserId(sessionUser.getId());
            boolean created = categoryService.createCategory(category);

            if (created) {
                res.status(201);
                return gson.toJson(toResponse(category));
            } else {
                res.status(400);
                return gson.toJson("Failed to create category.");
            }
        } catch (JsonSyntaxException e) {
            res.status(400);
            return gson.toJson("Invalid JSON format: " + e.getMessage());
        }
    }

    public Object listByUser(Request req, Response res) {
        res.type("application/json");
        try {
            User sessionUser = req.attribute("user");
            if (sessionUser == null || sessionUser.getId() == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }

            String nameParam = req.queryParams("name");
            String name = (nameParam == null || nameParam.isBlank()) ? null : nameParam;
            String mainCategoryIdParam = req.queryParams("main_category_id");
            String semanticQueryParam = req.queryParams("semantical_search");
            String semanticQuery = (semanticQueryParam == null || semanticQueryParam.isBlank()) ? null : semanticQueryParam;

            UUID mainCategoryId = null;
            if (mainCategoryIdParam != null && !mainCategoryIdParam.isBlank()) {
                mainCategoryId = UUID.fromString(mainCategoryIdParam);
            }

            List<Category> categories = categoryService.listCategories(sessionUser.getId(), name, mainCategoryId, semanticQuery);
            List<CategoryResponseDTO> response = categories.stream()
                    .map(this::toResponse)
                    .toList();
            res.status(200);
            return gson.toJson(response);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid UUID format: " + e.getMessage());
        }
    }

    public Object listByUserPaginated(Request req, Response res) {
        res.type("application/json");
        try {
            User sessionUser = req.attribute("user");
            if (sessionUser == null || sessionUser.getId() == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }
            String nameParam = req.queryParams("name");
            String name = (nameParam == null || nameParam.isBlank()) ? null : nameParam;
            String mainCategoryIdParam = req.queryParams("main_category_id");
            String semanticQueryParam = req.queryParams("semantical_search");
            String semanticQuery = (semanticQueryParam == null || semanticQueryParam.isBlank()) ? null : semanticQueryParam;

            UUID mainCategoryId = null;
            if (mainCategoryIdParam != null && !mainCategoryIdParam.isBlank()) {
                mainCategoryId = UUID.fromString(mainCategoryIdParam);
            }

            int page = req.queryParams("page") != null ? Integer.parseInt(req.queryParams("page")) : PaginationRequestDTO.DEFAULT_PAGE;
            int size = req.queryParams("size") != null ? Integer.parseInt(req.queryParams("size")) : PaginationRequestDTO.DEFAULT_PAGE_LIMIT;
            
            PaginationRequestDTO pagination = new PaginationRequestDTO(page, size);
            PaginatedResponseDTO<Category> paginatedCategories = categoryService.listCategoriesPaginated(sessionUser.getId(), name, mainCategoryId, semanticQuery, pagination);
            PaginatedResponseDTO<CategoryResponseDTO> response = new PaginatedResponseDTO<>(
                    paginatedCategories.getData().stream()
                            .map(this::toResponse)
                            .toList(),
                    paginatedCategories.getTotalItems(),
                    paginatedCategories.getCurrentPage(),
                    paginatedCategories.getPageLimit());
            
            res.status(200);
            return gson.toJson(response);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid parameters format: " + e.getMessage());
        }
    }

    public Object getById(Request req, Response res) {
        res.type("application/json");
        try {
            UUID id = UUID.fromString(req.params(":category_id"));
            Category category = categoryService.findCategoryById(id);

            if (category == null) {
                res.status(404);
                return gson.toJson("Category not found.");
            }

            User sessionUser = req.attribute("user");
            if (sessionUser != null && category.getUserId() != null && !category.getUserId().equals(sessionUser.getId())) {
                res.status(403);
                return gson.toJson("Access denied.");
            }
            res.status(200);
            return gson.toJson(toResponse(category));
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid ID format.");
        }
    }

    public Object update(Request req, Response res) {
        res.type("application/json");
        try {
            UUID id = UUID.fromString(req.params(":category_id"));
            CategoryUpdateDTO dto = gson.fromJson(req.body(), CategoryUpdateDTO.class);

            Category existing = categoryService.findCategoryById(id);
            User sessionUser = req.attribute("user");
            if (sessionUser == null || sessionUser.getId() == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }

            if (existing == null) {
                res.status(404);
                return gson.toJson("Category not found.");
            }

            if (existing.getUserId() == null || !existing.getUserId().equals(sessionUser.getId())) {
                res.status(403);
                return gson.toJson("Access denied.");
            }

            Category category = new Category();
            category.setId(id);
            category.setName(dto.getName());
            category.setImagePath(dto.getImagePath());
            category.setMainCategoryId(dto.getMainCategoryId());

            boolean updated = categoryService.updateCategory(category);
            if (updated) {
                res.status(200);
                return gson.toJson("Category updated successfully.");
            } else {
                res.status(400);
                return gson.toJson("Failed to update category.");
            }
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid ID format.");
        } catch (JsonSyntaxException e) {
            res.status(400);
            return gson.toJson("Invalid JSON format: " + e.getMessage());
        }
    }

    public Object delete(Request req, Response res) {
        res.type("application/json");
        try {
            UUID id = UUID.fromString(req.params(":category_id"));
            Category category = categoryService.findCategoryById(id);
            User sessionUser = req.attribute("user");
            if (sessionUser == null || sessionUser.getId() == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }

            if (category == null) {
                res.status(404);
                return gson.toJson("Category not found.");
            }

            if (category.getUserId() == null || !category.getUserId().equals(sessionUser.getId())) {
                res.status(403);
                return gson.toJson("Access denied.");
            }
            boolean deleted = categoryService.deleteCategory(id);

            if (deleted) {
                res.status(200);
                return gson.toJson("Category deleted successfully.");
            } else {
                res.status(404);
                return gson.toJson("Category not found.");
            }
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid ID format.");
        }
    }

    private CategoryResponseDTO toResponse(Category category) {
        if (category == null) {
            return null;
        }
        return new CategoryResponseDTO(
                category.getId(),
                category.getUserId(),
                category.getName(),
                category.getImagePath(),
                category.getMainCategoryId());
    }
}
