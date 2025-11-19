package com.ti2cc.api.dto;

import java.util.UUID;

import com.google.gson.JsonElement;

public class MessageCreateDTO {
    private UUID userId;
    private String role;
    private JsonElement parts;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
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
}
