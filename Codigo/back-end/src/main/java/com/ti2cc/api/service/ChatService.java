package com.ti2cc.api.service;

import java.util.List;
import java.util.UUID;

import com.ti2cc.api.dao.ChatDAO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Chat;

public class ChatService {

    private final ChatDAO chatDAO;

    public ChatService(ChatDAO chatDAO) {
        this.chatDAO = chatDAO;
    }

    public UUID createChat(UUID userId, String name) {
        if (userId == null) {
            System.err.println("User ID cannot be null.");
            return null;
        }

        String sanitizedName = sanitizeName(name);
        if (sanitizedName == null) {
            System.err.println("Chat name cannot be empty.");
            return null;
        }

        Chat chat = new Chat();
        chat.setId(UUID.randomUUID());
        chat.setUserId(userId);
        chat.setName(sanitizedName);

        boolean created = chatDAO.create(chat);
        return created ? chat.getId() : null;
    }

    public boolean updateChat(UUID chatId, String name) {
        if (chatId == null) {
            System.err.println("Chat ID cannot be null.");
            return false;
        }

        String sanitizedName = sanitizeName(name);
        if (sanitizedName == null) {
            System.err.println("Chat name cannot be empty.");
            return false;
        }

        Chat chat = new Chat();
        chat.setId(chatId);
        chat.setName(sanitizedName);

        return chatDAO.update(chat);
    }

    public boolean deleteChat(UUID chatId) {
        if (chatId == null) {
            System.err.println("Chat ID cannot be null.");
            return false;
        }

        return chatDAO.delete(chatId);
    }

    public Chat findChatById(UUID chatId) {
        if (chatId == null) {
            System.err.println("Chat ID cannot be null.");
            return null;
        }

        return chatDAO.getById(chatId);
    }

    public PaginatedResponseDTO<Chat> listChatsByUser(UUID userId, PaginationRequestDTO pagination) {
        if (userId == null) {
            System.err.println("User ID cannot be null.");
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        return chatDAO.listByUser(userId, pagination);
    }

    private String sanitizeName(String name) {
        if (name == null) {
            return null;
        }

        String trimmed = name.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
