package com.ti2cc.api.controller;

import java.util.List;
import java.util.UUID;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.ti2cc.api.dto.MessageCreateDTO;
import com.ti2cc.api.dto.MessageIdResponseDTO;
import com.ti2cc.api.model.Message;
import com.ti2cc.api.model.User;
import com.ti2cc.api.service.MessageService;
import com.ti2cc.api.util.GsonUtil;

import spark.Request;
import spark.Response;

public class MessageController {

    private final MessageService messageService;
    private final Gson gson = GsonUtil.getGson();

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    public Object create(Request req, Response res) {
        res.type("application/json");

        String chatIdParam = req.params(":chatId");
        if (chatIdParam == null || chatIdParam.isBlank()) {
            res.status(400);
            return gson.toJson("Path parameter 'chatId' is required.");
        }

        try {
            UUID chatId = UUID.fromString(chatIdParam);
            MessageCreateDTO dto = gson.fromJson(req.body(), MessageCreateDTO.class);

            if (dto == null) {
                res.status(400);
                return gson.toJson("Request body is required.");
            }

            User sessionUser = req.attribute("user");
            if (sessionUser == null || sessionUser.getId() == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }

            if (dto.getRole() == null || dto.getRole().isBlank()) {
                res.status(400);
                return gson.toJson("Field 'role' is required.");
            }

            if (dto.getParts() == null) {
                res.status(400);
                return gson.toJson("Field 'parts' is required and must be a JSON array.");
            }

            UUID messageId = messageService.createMessage(chatId, sessionUser.getId(), dto.getRole(), dto.getParts());
            if (messageId != null) {
                res.status(201);
                return gson.toJson(new MessageIdResponseDTO(messageId));
            }

            res.status(400);
            return gson.toJson("Failed to create message.");
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid UUID format: " + e.getMessage());
        } catch (JsonSyntaxException e) {
            res.status(400);
            return gson.toJson("Invalid JSON format: " + e.getMessage());
        }
    }

    public Object list(Request req, Response res) {
        res.type("application/json");

        String chatIdParam = req.params(":chatId");
        if (chatIdParam == null || chatIdParam.isBlank()) {
            res.status(400);
            return gson.toJson("Path parameter 'chatId' is required.");
        }

        try {
            UUID chatId = UUID.fromString(chatIdParam);
            User sessionUser = req.attribute("user");
            if (sessionUser == null || sessionUser.getId() == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }

            List<Message> messages = messageService.listMessagesByChat(chatId, sessionUser.getId());
            if (messages == null) {
                res.status(404);
                return gson.toJson("Chat not found or access denied.");
            }

            res.status(200);
            return gson.toJson(messages);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid UUID format: " + e.getMessage());
        }
    }
}
