package com.ti2cc.api.dto;

import com.google.gson.JsonElement;

public class MessageUpdateDTO {
    private JsonElement parts;

    public JsonElement getParts() {
        return parts;
    }

    public void setParts(JsonElement parts) {
        this.parts = parts;
    }
}
