package com.ti2cc.api.dto;

import com.google.gson.JsonElement;

public class MessageCreateDTO {
    private String role;
    private JsonElement parts;

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
