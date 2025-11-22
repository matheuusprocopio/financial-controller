package com.ti2cc.api.controller;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonSerializer;
import com.google.gson.JsonSyntaxException;
import com.ti2cc.api.dto.MessageCreateDTO;
import com.ti2cc.api.dto.MessageIdResponseDTO;
import com.ti2cc.api.model.Message;
import com.ti2cc.api.service.MessageService;

import spark.Request;
import spark.Response;

public class MessageController {

    private final MessageService messageService;
    private final Gson gson;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
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

            if (dto.getUserId() == null) {
                res.status(400);
                return gson.toJson("Field 'userId' is required.");
            }

            if (dto.getRole() == null || dto.getRole().isBlank()) {
                res.status(400);
                return gson.toJson("Field 'role' is required.");
            }

            if (dto.getParts() == null) {
                res.status(400);
                return gson.toJson("Field 'parts' is required and must be a JSON array.");
            }

            UUID messageId = messageService.createMessage(chatId, dto.getUserId(), dto.getRole(), dto.getParts());
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

        String userIdParam = req.queryParams("user_id");
        if (userIdParam == null || userIdParam.isBlank()) {
            res.status(400);
            return gson.toJson("Query parameter 'user_id' is required.");
        }

        try {
            UUID chatId = UUID.fromString(chatIdParam);
            UUID userId = UUID.fromString(userIdParam);

            List<Message> messages = messageService.listMessagesByChat(chatId, userId);
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
