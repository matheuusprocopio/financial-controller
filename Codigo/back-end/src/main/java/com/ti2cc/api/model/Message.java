package com.ti2cc.api.model;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.google.gson.JsonElement;

public class Message {
    private UUID id;
    private UUID chatId;
    private String role;
    private JsonElement parts;
    private OffsetDateTime createdAt;

    public Message() {
        this(null, null, null, null, null);
    }

    public Message(UUID id, UUID chatId, String role, JsonElement parts, OffsetDateTime createdAt) {
        this.id = id;
        this.chatId = chatId;
        this.role = role;
        this.parts = parts;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getChatId() {
        return chatId;
    }

    public void setChatId(UUID chatId) {
        this.chatId = chatId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public JsonElement getParts() {
        return parts;
    }

    public void setParts(JsonElement parts) {
        this.parts = parts;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
