package com.ti2cc.api.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class User {
    private UUID id;
    private String name;
    private String email;
    private OffsetDateTime createdAt;

    public User(UUID id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public UUID getId() {
        return this.id;
    }

    public void setId(UUID newId) {
        this.id = newId;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
