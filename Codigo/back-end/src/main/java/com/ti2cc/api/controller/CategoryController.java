package com.ti2cc.api.controller;

import java.util.List;
import java.util.UUID;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.ti2cc.api.dto.CategoryUpdateDTO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Category;
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
            Category category = gson.fromJson(req.body(), Category.class);
            boolean created = categoryService.createCategory(category);

            if (created) {
                res.status(201);
                return gson.toJson(category);
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
        String userIdParam = req.queryParams("user_id");
        if (userIdParam == null || userIdParam.isBlank()) {
            res.status(400);
            return gson.toJson("Query parameter 'user_id' is required.");
        }

        try {
            UUID userId = UUID.fromString(userIdParam);
            String nameParam = req.queryParams("name");
            String name = (nameParam == null || nameParam.isBlank()) ? null : nameParam;
            String mainCategoryIdParam = req.queryParams("main_category_id");

            UUID mainCategoryId = null;
            if (mainCategoryIdParam != null && !mainCategoryIdParam.isBlank()) {
                mainCategoryId = UUID.fromString(mainCategoryIdParam);
            }

            List<Category> categories = categoryService.listCategories(userId, name, mainCategoryId);
            res.status(200);
            return gson.toJson(categories);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid UUID format: " + e.getMessage());
        }
    }

    public Object listByUserPaginated(Request req, Response res) {
        res.type("application/json");
        String userIdParam = req.queryParams("user_id");
        if (userIdParam == null || userIdParam.isBlank()) {
            res.status(400);
            return gson.toJson("Query parameter 'user_id' is required.");
        }

        try {
            UUID userId = UUID.fromString(userIdParam);
            String nameParam = req.queryParams("name");
            String name = (nameParam == null || nameParam.isBlank()) ? null : nameParam;
            String mainCategoryIdParam = req.queryParams("main_category_id");

            UUID mainCategoryId = null;
            if (mainCategoryIdParam != null && !mainCategoryIdParam.isBlank()) {
                mainCategoryId = UUID.fromString(mainCategoryIdParam);
            }

            int page = req.queryParams("page") != null ? Integer.parseInt(req.queryParams("page")) : PaginationRequestDTO.DEFAULT_PAGE;
            int size = req.queryParams("size") != null ? Integer.parseInt(req.queryParams("size")) : PaginationRequestDTO.DEFAULT_PAGE_LIMIT;
            
            PaginationRequestDTO pagination = new PaginationRequestDTO(page, size);
            PaginatedResponseDTO<Category> paginatedCategories = categoryService.listCategoriesPaginated(userId, name, mainCategoryId, pagination);
            
            res.status(200);
            return gson.toJson(paginatedCategories);
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

            if (category != null) {
                res.status(200);
                return gson.toJson(category);
            } else {
                res.status(404);
                return gson.toJson("Category not found.");
            }
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
}
