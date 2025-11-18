package com.ti2cc.api.dto;

import java.util.UUID;

public class ChatIdResponseDTO {
    private final UUID id;

    public ChatIdResponseDTO(UUID id) {
        this.id = id;
    }

    public UUID getId() {
        return id;
    }
}
