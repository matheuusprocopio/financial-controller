package com.ti2cc.api.dto;

import com.ti2cc.api.model.User;

public class AuthResponseDTO {
    private boolean success;
    private String message;
    private User user;
    private String sessionId;

    public AuthResponseDTO() {
    }

    public AuthResponseDTO(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public AuthResponseDTO(boolean success, String message, User user, String sessionId) {
        this.success = success;
        this.message = message;
        this.user = user;
        this.sessionId = sessionId;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}

