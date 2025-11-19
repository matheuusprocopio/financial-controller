package com.ti2cc.api.dto;

import java.util.UUID;

public class MessageIdResponseDTO {
    private UUID messageId;

    public MessageIdResponseDTO(UUID messageId) {
        this.messageId = messageId;
    }

    public UUID getMessageId() {
        return messageId;
    }

    public void setMessageId(UUID messageId) {
        this.messageId = messageId;
    }
}
