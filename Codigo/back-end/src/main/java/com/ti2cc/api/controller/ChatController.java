package com.ti2cc.api.controller;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonSerializer;
import com.google.gson.JsonSyntaxException;
import com.ti2cc.api.dto.ChatCreateDTO;
import com.ti2cc.api.dto.ChatIdResponseDTO;
import com.ti2cc.api.dto.ChatUpdateDTO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Chat;
import com.ti2cc.api.service.ChatService;

import spark.Request;
import spark.Response;

public class ChatController {

    private final ChatService chatService;
    private final Gson gson;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
        this.gson = new GsonBuilder()
                .registerTypeAdapter(OffsetDateTime.class,
                        (JsonSerializer<OffsetDateTime>) (value, type, context) ->
                                context.serialize(value != null ? value.toString() : null))
                .registerTypeAdapter(OffsetDateTime.class,
                        (JsonDeserializer<OffsetDateTime>) (json, type, context) ->
                                (json == null || json.isJsonNull())
                                        ? null
                                        : OffsetDateTime.parse(json.getAsString()))
                .create();
    }

    public Object create(Request req, Response res) {
        res.type("application/json");

        String userIdParam = req.queryParams("user_id");
        if (userIdParam == null || userIdParam.isBlank()) {
            res.status(400);
            return gson.toJson("Query parameter 'user_id' is required.");
        }

        try {
            UUID userId = UUID.fromString(userIdParam);
            ChatCreateDTO dto = gson.fromJson(req.body(), ChatCreateDTO.class);

            if (dto == null || dto.getName() == null || dto.getName().isBlank()) {
                res.status(400);
                return gson.toJson("Field 'name' is required.");
            }

            UUID chatId = chatService.createChat(userId, dto.getName());
            if (chatId != null) {
                res.status(201);
                return gson.toJson(new ChatIdResponseDTO(chatId));
            }

            res.status(400);
            return gson.toJson("Failed to create chat.");
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid UUID format: " + e.getMessage());
        } catch (JsonSyntaxException e) {
            res.status(400);
            return gson.toJson("Invalid JSON format: " + e.getMessage());
        }
    }

    public Object getById(Request req, Response res) {
        res.type("application/json");
        try {
            UUID chatId = UUID.fromString(req.params(":chatId"));
            Chat chat = chatService.findChatById(chatId);

            if (chat == null) {
                res.status(404);
                return gson.toJson("Chat not found.");
            }

            res.status(200);
            return gson.toJson(chat);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid chat ID format.");
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
            PaginationRequestDTO pagination = buildPagination(req);

            PaginatedResponseDTO<Chat> result = chatService.listChatsByUser(userId, pagination);
            res.status(200);
            return gson.toJson(result);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid parameter: " + e.getMessage());
        }
    }

    public Object update(Request req, Response res) {
        res.type("application/json");
        try {
            UUID chatId = UUID.fromString(req.params(":chatId"));
            ChatUpdateDTO dto = gson.fromJson(req.body(), ChatUpdateDTO.class);

            if (dto == null || dto.getName() == null || dto.getName().isBlank()) {
                res.status(400);
                return gson.toJson("Field 'name' is required.");
            }

            boolean updated = chatService.updateChat(chatId, dto.getName());
            if (updated) {
                res.status(200);
                return gson.toJson("Chat updated successfully.");
            }

            res.status(404);
            return gson.toJson("Chat not found.");
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid chat ID format.");
        } catch (JsonSyntaxException e) {
            res.status(400);
            return gson.toJson("Invalid JSON format: " + e.getMessage());
        }
    }

    public Object delete(Request req, Response res) {
        res.type("application/json");
        try {
            UUID chatId = UUID.fromString(req.params(":chatId"));
            boolean deleted = chatService.deleteChat(chatId);

            if (deleted) {
                res.status(200);
                return gson.toJson("Chat deleted successfully.");
            }

            res.status(404);
            return gson.toJson("Chat not found.");
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid chat ID format.");
        }
    }

    private PaginationRequestDTO buildPagination(Request req) {
        int page = PaginationRequestDTO.DEFAULT_PAGE;
        int limit = PaginationRequestDTO.DEFAULT_PAGE_LIMIT;

        String pageParam = req.queryParams("page");
        if (pageParam != null && !pageParam.isBlank()) {
            page = Integer.parseInt(pageParam);
        }

        String limitParam = req.queryParams("size");
        if (limitParam != null && !limitParam.isBlank()) {
            limit = Integer.parseInt(limitParam);
        }

        return new PaginationRequestDTO(page, limit);
    }
}
