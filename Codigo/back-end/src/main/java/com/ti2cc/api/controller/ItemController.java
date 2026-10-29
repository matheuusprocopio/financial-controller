package com.ti2cc.api.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.UUID;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.ti2cc.api.dto.CreateItemDTO;
import com.ti2cc.api.dto.DateRangeDTO;
import com.ti2cc.api.dto.ItemAnalyticsRequestDTO;
import com.ti2cc.api.dto.ItemAnalyticsResponseDTO;
import com.ti2cc.api.dto.ItemResponseDTO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.dto.UpdateItemDTO;
import com.ti2cc.api.model.Item;
import com.ti2cc.api.service.ItemService;
import com.ti2cc.api.service.ItemService.PossibleDuplicateException;
import com.ti2cc.api.util.GsonUtil;

import spark.Request;
import spark.Response;

public class ItemController {

    private final ItemService itemService;
    private final Gson gson = GsonUtil.getGson();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    public Object create(Request req, Response res) {
        res.type("application/json");
        try {
            UUID sessionUserId = getUserIdFromRequest(req);
            if (sessionUserId == null) {
                res.status(401);
                return gson.toJson("Sessão inválida ou usuário não identificado.");
            }

            CreateItemDTO dto = gson.fromJson(req.body(), CreateItemDTO.class);
            if (dto == null) {
                res.status(400);
                return gson.toJson("Request body is required.");
            }

            Item item = toItem(dto, sessionUserId);
            boolean created = itemService.createItem(item, dto.isDuplicateConfirmed());

            if (created) {
                res.status(201);
                return gson.toJson(toResponse(item));
            } else {
                res.status(400);
                return gson.toJson("Failed to create item.");
            }
        } catch (PossibleDuplicateException e) {
            res.status(409);
            return gson.toJson(new DuplicateResponse(e.getMatches().stream().map(this::toResponse).toList()));
        } catch (JsonSyntaxException e) {
            res.status(400);
            return gson.toJson("Invalid JSON format: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid request body: " + e.getMessage());
        }
    }

    public Object checkDuplicates(Request req, Response res) {
        res.type("application/json");
        UUID userId = getUserIdFromRequest(req);
        if (userId == null) {
            res.status(401);
            return gson.toJson("Sessão inválida ou usuário não identificado.");
        }
        try {
            CreateItemDTO[] entries = gson.fromJson(req.body(), CreateItemDTO[].class);
            if (entries == null || entries.length == 0 || entries.length > 20) {
                res.status(400);
                return gson.toJson("Expected 1 to 20 transactions.");
            }
            Item[] items = new Item[entries.length];
            java.util.List<java.util.List<DuplicateMatch>> matches = new java.util.ArrayList<>();
            for (int i = 0; i < entries.length; i++) {
                if (entries[i] == null || entries[i].getAccountId() == null
                        || entries[i].getDate() == null || entries[i].getType() == null
                        || entries[i].getAmount() == null || entries[i].getAmount() <= 0
                        || entries[i].getName() == null || entries[i].getName().isBlank()) {
                    res.status(400);
                    return gson.toJson("Invalid transaction at index " + i);
                }
                items[i] = toItem(entries[i], userId);
                java.util.List<DuplicateMatch> row = new java.util.ArrayList<>();
                for (Item existing : itemService.findPossibleDuplicates(items[i])) {
                    row.add(new DuplicateMatch("history", -1, toResponse(existing)));
                }
                for (int j : itemService.findEarlierBatchDuplicates(java.util.Arrays.asList(items), i)) {
                    row.add(new DuplicateMatch("batch", j, null));
                }
                matches.add(row);
            }
            return gson.toJson(matches);
        } catch (JsonSyntaxException | IllegalArgumentException e) {
            res.status(400);
            return gson.toJson(e.getMessage());
        }
    }

    private Item toItem(CreateItemDTO dto, UUID userId) {
        Item item = new Item();
        item.setCategoryId(dto.getCategoryId() != null ? UUID.fromString(dto.getCategoryId()) : null);
        item.setAccountId(dto.getAccountId() != null ? UUID.fromString(dto.getAccountId()) : null);
        item.setUserId(userId);
        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setAmount(dto.getAmount());
        item.setDate(dto.getDate());
        item.setType(dto.getType());
        return item;
    }

    private record DuplicateMatch(String source, int batchIndex, ItemResponseDTO item) {}
    private record DuplicateResponse(java.util.List<ItemResponseDTO> duplicates) {}

    public Object list(Request req, Response res) {
        res.type("application/json");
        UUID userId = getUserIdFromRequest(req);
        if (userId == null) {
            res.status(401);
            return gson.toJson("Sessão inválida ou usuário não identificado.");
        }

        try {
            String categoryIdParam = req.queryParams("category_id");
            String accountIdParam = req.queryParams("account_id");
            String nameFilter = req.queryParams("name");
            String typeFilter = req.queryParams("type");
            String semanticQuery = req.queryParams("semantical_search");
            PaginationRequestDTO pagination = buildPagination(req);
            DateRangeDTO dateRange = buildDateRange(req);
            PaginatedResponseDTO<Item> items;

            UUID categoryId = categoryIdParam != null && !categoryIdParam.isBlank() ? UUID.fromString(categoryIdParam) : null;
            UUID accountId = accountIdParam != null && !accountIdParam.isBlank() ? UUID.fromString(accountIdParam) : null;
            boolean hasCategoryFilter = categoryId != null;
            boolean hasAccountFilter = accountId != null;

            if (hasCategoryFilter && hasAccountFilter) {
                items = itemService.listItemsByCategoryAndAccount(categoryId, accountId, userId, nameFilter, typeFilter, semanticQuery, dateRange, pagination);
            } else if (hasCategoryFilter) {
                items = itemService.listItemsByCategoryId(categoryId, userId, nameFilter, typeFilter, semanticQuery, dateRange, pagination);
            } else if (hasAccountFilter) {
                items = itemService.listItemsByAccountId(accountId, userId, nameFilter, typeFilter, semanticQuery, dateRange, pagination);
            } else {
                items = itemService.listItemsByUserId(userId, nameFilter, typeFilter, semanticQuery, dateRange, pagination);
            }

            PaginatedResponseDTO<ItemResponseDTO> response = new PaginatedResponseDTO<>(
                    items.getData().stream().map(this::toResponse).toList(),
                    items.getTotalItems(),
                    items.getCurrentPage(),
                    items.getPageLimit()
            );

            res.status(200);
            return gson.toJson(response);
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

            UUID sessionUserId = req.attribute("userId");
            if (item != null && !item.getUserId().equals(sessionUserId)) {
                res.status(403);
                return gson.toJson("Access denied.");
            }

            if (item != null) {
                res.status(200);
                return gson.toJson(toResponse(item));
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
            UUID userId = getUserIdFromRequest(req);
            if (userId == null) {
                res.status(401);
                return gson.toJson("Sessão inválida ou usuário não identificado.");
            }
            String nameFilter = req.queryParams("name");
            String typeFilter = req.queryParams("type");
            String semanticQuery = req.queryParams("semantical_search");
            PaginationRequestDTO pagination = buildPagination(req);
            DateRangeDTO dateRange = buildDateRange(req);
            PaginatedResponseDTO<Item> items = itemService.listItemsByUserId(userId, nameFilter, typeFilter, semanticQuery, dateRange, pagination);
            PaginatedResponseDTO<ItemResponseDTO> response = new PaginatedResponseDTO<>(
                    items.getData().stream().map(this::toResponse).toList(),
                    items.getTotalItems(),
                    items.getCurrentPage(),
                    items.getPageLimit()
            );
            res.status(200);
            return gson.toJson(response);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson(e.getMessage());
        }
    }

    public Object getByCategoryId(Request req, Response res) {
        res.type("application/json");
        UUID userId = getUserIdFromRequest(req);
        if (userId == null) {
            res.status(401);
            return gson.toJson("Sessão inválida ou usuário não identificado.");
        }

        try {
            UUID categoryId = UUID.fromString(req.params(":categoryId"));
            String nameFilter = req.queryParams("name");
            String typeFilter = req.queryParams("type");
            String semanticQuery = req.queryParams("semantical_search");
            PaginationRequestDTO pagination = buildPagination(req);
            DateRangeDTO dateRange = buildDateRange(req);
            PaginatedResponseDTO<Item> items = itemService.listItemsByCategoryId(categoryId, userId, nameFilter, typeFilter, semanticQuery, dateRange, pagination);
            PaginatedResponseDTO<ItemResponseDTO> response = new PaginatedResponseDTO<>(
                    items.getData().stream().map(this::toResponse).toList(),
                    items.getTotalItems(),
                    items.getCurrentPage(),
                    items.getPageLimit()
            );
            res.status(200);
            return gson.toJson(response);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson(e.getMessage());
        }
    }

    public Object getByAccountId(Request req, Response res) {
        res.type("application/json");
        UUID userId = getUserIdFromRequest(req);
        if (userId == null) {
            res.status(401);
            return gson.toJson("Sessão inválida ou usuário não identificado.");
        }

        try {
            UUID accountId = UUID.fromString(req.params(":accountId"));
            String nameFilter = req.queryParams("name");
            String typeFilter = req.queryParams("type");
            String semanticQuery = req.queryParams("semantical_search");
            PaginationRequestDTO pagination = buildPagination(req);
            DateRangeDTO dateRange = buildDateRange(req);
            PaginatedResponseDTO<Item> items = itemService.listItemsByAccountId(accountId, userId, nameFilter, typeFilter, semanticQuery, dateRange, pagination);
            PaginatedResponseDTO<ItemResponseDTO> response = new PaginatedResponseDTO<>(
                    items.getData().stream().map(this::toResponse).toList(),
                    items.getTotalItems(),
                    items.getCurrentPage(),
                    items.getPageLimit()
            );
            res.status(200);
            return gson.toJson(response);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson(e.getMessage());
        }
    }

    public Object update(Request req, Response res) {
        res.type("application/json");
        try {
            UUID sessionUserId = getUserIdFromRequest(req);
            if (sessionUserId == null) {
                res.status(401);
                return gson.toJson("Sessão inválida ou usuário não identificado.");
            }

            UUID id = UUID.fromString(req.params(":itemId"));
            UpdateItemDTO dto = gson.fromJson(req.body(), UpdateItemDTO.class);
            Item item = new Item();
            item.setId(id);
            item.setUserId(sessionUserId);
            if (dto != null) {
                item.setCategoryId(dto.getCategoryId() != null ? UUID.fromString(dto.getCategoryId()) : null);
                item.setAccountId(dto.getAccountId() != null ? UUID.fromString(dto.getAccountId()) : null);
                item.setName(dto.getName());
                item.setDescription(dto.getDescription());
                item.setAmount(dto.getAmount());
                item.setDate(dto.getDate());
                item.setType(dto.getType());
            }

            Item existing = itemService.findItemById(id);
            if (existing != null && !existing.getUserId().equals(sessionUserId)) {
                res.status(403);
                return gson.toJson("Usuário não autorizado a alterar este item.");
            }

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
            UUID sessionUserId = getUserIdFromRequest(req);
            if (sessionUserId == null) {
                res.status(401);
                return gson.toJson("Sessão inválida ou usuário não identificado.");
            }

            UUID id = UUID.fromString(req.params(":itemId"));

            Item existing = itemService.findItemById(id);
            if (existing != null && !existing.getUserId().equals(sessionUserId)) {
                res.status(403);
                return gson.toJson("Usuário não autorizado a deletar este item.");
            }

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

    public Object analytics(Request req, Response res) {
        res.type("application/json");

        try {
            UUID sessionUserId = getUserIdFromRequest(req);
            if (sessionUserId == null) {
                res.status(401);
                return gson.toJson(new Error("Usuário não autenticado."));
            }

            ItemAnalyticsRequestDTO dto = gson.fromJson(req.body(), ItemAnalyticsRequestDTO.class);

            if (dto == null) {
                res.status(400);
                return gson.toJson(new Error("Corpo da requisição vazio ou inválido."));
            }

            dto.setUserId(sessionUserId);

            ItemAnalyticsResponseDTO resp = itemService.getAnalytics(dto);

            res.status(200);
            return gson.toJson(resp);

        } catch (com.google.gson.JsonSyntaxException e) {
            res.status(400);
            return gson.toJson(new Error("JSON inválido: verifique a formatação."));
            
        } catch (Exception e) {
            e.printStackTrace(); 
            res.status(500);
            return gson.toJson(new Error("Erro interno ao processar analytics."));
        }
    }


    private PaginationRequestDTO buildPagination(Request req) {
        String pageParam = getFirstParam(req, "page");
        String sizeParam = getFirstParam(req, "size", "pageLimit", "page_limit");

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
                throw new IllegalArgumentException("Query parameter 'size'/'pageLimit' must be an integer.");
            }
        }

        return new PaginationRequestDTO(page, size);
    }

    private DateRangeDTO buildDateRange(Request req) {
        LocalDate startDate = parseDate(getFirstParam(req, "start_date", "startDate"), "start_date/startDate");
        LocalDate endDate = parseDate(getFirstParam(req, "end_date", "endDate"), "end_date/endDate");
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

    private UUID getUserIdFromRequest(Request req) {
        UUID userIdAttr = req.attribute("userId");
        if (userIdAttr != null) {
            return userIdAttr;
        }

        String userIdParam = req.queryParams("user_id");
        if (userIdParam == null || userIdParam.isBlank()) {
            return null;
        }

        return UUID.fromString(userIdParam);
    }

    private String getFirstParam(Request req, String... names) {
        for (String name : names) {
            String value = req.queryParams(name);
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private ItemResponseDTO toResponse(Item item) {
        if (item == null) {
            return null;
        }
        return new ItemResponseDTO(
                item.getId(),
                item.getCategoryId(),
                item.getUserId(),
                item.getAccountId(),
                item.getName(),
                item.getDescription(),
                item.getAmount(),
                item.getDate(),
                item.getType()
        );
    }
}
