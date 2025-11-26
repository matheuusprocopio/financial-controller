package com.ti2cc.api.controller;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.ti2cc.api.dto.ChatCreateDTO;
import com.ti2cc.api.dto.ChatIdResponseDTO;
import com.ti2cc.api.dto.ChatUpdateDTO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Chat;
import com.ti2cc.api.model.User;
import com.ti2cc.api.service.ChatService;
import com.ti2cc.api.util.GsonUtil;

import spark.Request;
import spark.Response;

public class ChatController {

    private final ChatService chatService;
    private final Gson gson = GsonUtil.getGson();

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    public Object create(Request req, Response res) {
        res.type("application/json");

        try {
            User sessionUser = req.attribute("user");
            if (sessionUser == null || sessionUser.getId() == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }
            ChatCreateDTO dto = gson.fromJson(req.body(), ChatCreateDTO.class);

            if (dto == null || dto.getName() == null || dto.getName().isBlank()) {
                res.status(400);
                return gson.toJson("Field 'name' is required.");
            }

            UUID chatId = chatService.createChat(sessionUser.getId(), dto.getName());
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

            User sessionUser = req.attribute("user");
            if (sessionUser != null && chat.getUserId() != null && !chat.getUserId().equals(sessionUser.getId())) {
                res.status(403);
                return gson.toJson("Access denied.");
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
        try {
            User sessionUser = req.attribute("user");
            if (sessionUser == null || sessionUser.getId() == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }
            PaginationRequestDTO pagination = buildPagination(req);

            PaginatedResponseDTO<Chat> result = chatService.listChatsByUser(sessionUser.getId(), pagination);
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
            Chat chat = chatService.findChatById(chatId);
            User sessionUser = req.attribute("user");
            if (sessionUser == null || sessionUser.getId() == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }

            if (chat == null) {
                res.status(404);
                return gson.toJson("Chat not found.");
            }

            if (chat.getUserId() == null || !chat.getUserId().equals(sessionUser.getId())) {
                res.status(403);
                return gson.toJson("Access denied.");
            }

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
            Chat chat = chatService.findChatById(chatId);
            if (chat == null) {
                res.status(404);
                return gson.toJson("Chat not found.");
            }

            User sessionUser = req.attribute("user");
            if (sessionUser == null || sessionUser.getId() == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }

            if (chat.getUserId() == null || !chat.getUserId().equals(sessionUser.getId())) {
                res.status(403);
                return gson.toJson("Access denied.");
            }

            boolean deleted = chatService.deleteChat(chatId);

            if (deleted) {
                UUID userId = chat.getUserId();
                Chat mostRecentChat = chatService.findMostRecentChatByUser(userId);

                UUID nextChatId = mostRecentChat != null
                        ? mostRecentChat.getId()
                        : chatService.createChat(userId, OffsetDateTime.now().toString());

                if (nextChatId == null) {
                    res.status(500);
                    return gson.toJson("Chat deleted, but failed to create fallback chat.");
                }

                res.status(200);
                return gson.toJson(new ChatIdResponseDTO(nextChatId));
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
