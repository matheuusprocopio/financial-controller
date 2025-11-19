package com.ti2cc.api.service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import com.google.gson.JsonElement;
import com.ti2cc.api.dao.ChatDAO;
import com.ti2cc.api.dao.MessageDAO;
import com.ti2cc.api.model.Chat;
import com.ti2cc.api.model.Message;

public class MessageService {

    private final MessageDAO messageDAO;
    private final ChatDAO chatDAO;

    public MessageService(MessageDAO messageDAO, ChatDAO chatDAO) {
        this.messageDAO = messageDAO;
        this.chatDAO = chatDAO;
    }

    public UUID createMessage(UUID chatId, UUID userId, String role, JsonElement parts) {
        if (chatId == null) {
            System.err.println("Chat ID cannot be null when creating a message.");
            return null;
        }

        if (userId == null) {
            System.err.println("User ID cannot be null when creating a message.");
            return null;
        }

        Chat chat = chatDAO.getById(chatId);
        if (chat == null) {
            System.err.println("Chat not found for message creation.");
            return null;
        }

        if (chat.getUserId() == null || !chat.getUserId().equals(userId)) {
            System.err.println("User not allowed to add message to this chat.");
            return null;
        }

        String normalizedRole = normalizeRole(role);
        if (normalizedRole == null) {
            System.err.println("Invalid role. Allowed values are assistant, user or system.");
            return null;
        }

        if (parts == null || !parts.isJsonArray()) {
            System.err.println("Parts payload must be a JSON array.");
            return null;
        }

        Message message = new Message();
        message.setId(UUID.randomUUID());
        message.setChatId(chatId);
        message.setRole(normalizedRole);
        message.setParts(parts.deepCopy());

        boolean created = messageDAO.create(message);
        return created ? message.getId() : null;
    }

    public List<Message> listMessagesByChat(UUID chatId, UUID userId) {
        if (chatId == null) {
            System.err.println("Chat ID cannot be null when listing messages.");
            return null;
        }

        if (userId == null) {
            System.err.println("User ID cannot be null when listing messages.");
            return null;
        }

        Chat chat = chatDAO.getById(chatId);
        if (chat == null) {
            System.err.println("Chat not found when listing messages.");
            return null;
        }

        if (chat.getUserId() == null || !chat.getUserId().equals(userId)) {
            System.err.println("User not allowed to list messages for this chat.");
            return null;
        }

        return messageDAO.listByChatId(chatId);
    }

    private String normalizeRole(String role) {
        if (role == null) {
            return null;
        }

        String value = role.trim().toLowerCase(Locale.ROOT);
        return switch (value) {
            case "assistant", "user", "system" -> value;
            default -> null;
        };
    }
}
