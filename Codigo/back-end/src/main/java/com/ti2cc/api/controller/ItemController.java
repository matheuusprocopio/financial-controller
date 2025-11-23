package com.ti2cc.api.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.UUID;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonSerializer;
import com.google.gson.JsonSyntaxException;
import com.ti2cc.api.dto.DateRangeDTO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Item;
import com.ti2cc.api.service.ItemService;

import spark.Request;
import spark.Response;

public class ItemController {

    private final ItemService itemService;
    private final Gson gson;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;

        this.gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class,
                        (JsonDeserializer<LocalDate>) (json, type, context) -> {
                            String dateStr = json.getAsString();
                            if (dateStr.contains("T")) {
                                return LocalDate.parse(dateStr.substring(0, 10));
                            } else {
                                return LocalDate.parse(dateStr);
                            }
                        })
                .registerTypeAdapter(LocalDate.class,
                        (JsonSerializer<LocalDate>) (date, type, context) ->
                                context.serialize(date.toString()))
                .create();
    }

    public Object create(Request req, Response res) {
        res.type("application/json");
        try {
            Item item = gson.fromJson(req.body(), Item.class);
            boolean created = itemService.createItem(item);

            if (created) {
                res.status(201);
                return gson.toJson(item);
            } else {
                res.status(400);
                return gson.toJson("Failed to create item.");
            }
        } catch (JsonSyntaxException e) {
            res.status(400);
            return gson.toJson("Invalid JSON format: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid request body: " + e.getMessage());
        }
    }

    public Object list(Request req, Response res) {
        res.type("application/json");
        String userIdParam = req.queryParams("user_id");
        if (userIdParam == null) {
            res.status(400);
            return gson.toJson("Query parameter 'user_id' is required.");
        }

        try {
            UUID userId = UUID.fromString(userIdParam);
            String categoryIdParam = req.queryParams("category_id");
            String nameFilter = req.queryParams("name");
            PaginationRequestDTO pagination = buildPagination(req);
            DateRangeDTO dateRange = buildDateRange(req);
            PaginatedResponseDTO<Item> items;

            if (categoryIdParam != null && !categoryIdParam.isBlank()) {
                UUID categoryId = UUID.fromString(categoryIdParam);
                items = itemService.listItemsByCategoryId(categoryId, userId, nameFilter, dateRange, pagination);
            } else {
                items = itemService.listItemsByUserId(userId, nameFilter, dateRange, pagination);
            }

            res.status(200);
            return gson.toJson(items);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson(e.getMessage());
        }
    }

    public Object getById(Request req, Response res) {
        res.type("application/json");
        try {
            UUID id = UUID.fromString(req.params(":itemId"));
            Item item = itemService.findItemById(id);

            if (item != null) {
                res.status(200);
                return gson.toJson(item);
            } else {
                res.status(404);
                return gson.toJson("Item not found.");
            }
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid UUID format.");
        }
    }

    public Object listByUserPath(Request req, Response res) {
        res.type("application/json");
        try {
            UUID userId = UUID.fromString(req.params(":userId"));
            String nameFilter = req.queryParams("name");
            PaginationRequestDTO pagination = buildPagination(req);
            DateRangeDTO dateRange = buildDateRange(req);
            PaginatedResponseDTO<Item> items = itemService.listItemsByUserId(userId, nameFilter, dateRange, pagination);
            res.status(200);
            return gson.toJson(items);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson(e.getMessage());
        }
    }

    public Object getByCategoryId(Request req, Response res) {
        res.type("application/json");
        String userIdParam = req.queryParams("user_id");
        if (userIdParam == null) {
            res.status(400);
            return gson.toJson("Query parameter 'user_id' is required.");
        }

        try {
            UUID categoryId = UUID.fromString(req.params(":categoryId"));
            UUID userId = UUID.fromString(userIdParam);
            String nameFilter = req.queryParams("name");
            PaginationRequestDTO pagination = buildPagination(req);
            DateRangeDTO dateRange = buildDateRange(req);
            PaginatedResponseDTO<Item> items = itemService.listItemsByCategoryId(categoryId, userId, nameFilter, dateRange, pagination);
            res.status(200);
            return gson.toJson(items);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson(e.getMessage());
        }
    }

    public Object update(Request req, Response res) {
        res.type("application/json");
        try {
            UUID id = UUID.fromString(req.params(":itemId"));
            Item item = gson.fromJson(req.body(), Item.class);
            item.setId(id);

            boolean updated = itemService.updateItem(item);
            if (updated) {
                res.status(200);
                return gson.toJson("Item updated successfully.");
            } else {
                res.status(400);
                return gson.toJson("Failed to update item.");
            }
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid UUID format.");
        } catch (JsonSyntaxException e) {
            res.status(400);
            return gson.toJson("Invalid JSON format: " + e.getMessage());
        }
    }

    public Object delete(Request req, Response res) {
        res.type("application/json");
        try {
            UUID id = UUID.fromString(req.params(":itemId"));
            boolean deleted = itemService.deleteItem(id);

            if (deleted) {
                res.status(200);
                return gson.toJson("Item deleted successfully.");
            } else {
                res.status(404);
                return gson.toJson("Item not found.");
            }
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid UUID format.");
        }
    }

    private PaginationRequestDTO buildPagination(Request req) {
        String pageParam = req.queryParams("page");
        String sizeParam = req.queryParams("size");

        int page = PaginationRequestDTO.DEFAULT_PAGE;
        int size = PaginationRequestDTO.DEFAULT_PAGE_LIMIT;

        if (pageParam != null && !pageParam.isBlank()) {
            try {
                page = Integer.parseInt(pageParam);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Query parameter 'page' must be an integer.");
            }
        }

        if (sizeParam != null && !sizeParam.isBlank()) {
            try {
                size = Integer.parseInt(sizeParam);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Query parameter 'size' must be an integer.");
            }
        }

        return new PaginationRequestDTO(page, size);
    }

    private DateRangeDTO buildDateRange(Request req) {
        LocalDate startDate = parseDate(req.queryParams("start_date"), "start_date");
        LocalDate endDate = parseDate(req.queryParams("end_date"), "end_date");
        return new DateRangeDTO(startDate, endDate);
    }

    private LocalDate parseDate(String value, String paramName) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(value, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Query parameter '" + paramName + "' must be in ISO format (yyyy-MM-dd).");
        }
    }
}
