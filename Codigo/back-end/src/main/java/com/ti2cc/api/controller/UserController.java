package com.ti2cc.api.controller;

import com.google.gson.Gson;
import com.ti2cc.api.model.User;
import com.ti2cc.api.service.UserService;

import java.util.UUID;

public class UserController {

    private final UserService userService;
    private final Gson gson = new Gson();

    public UserController(UserService userService) {
        this.userService = userService;
    }

    public String create(String body) {
        User user = gson.fromJson(body, User.class);
        boolean created = userService.createUser(user);

        if (created) {
            return gson.toJson(user);
        } else {
            return gson.toJson("Failed to create user.");
        }
    }

    public String getAll() {
        return gson.toJson(userService.listAllUsers());
    }

    public String getById(String idStr) {
        try {
            UUID id = UUID.fromString(idStr);
            User user = userService.findUserById(id);

            if (user != null) {
                return gson.toJson(user);
            } else {
                return gson.toJson("User not found.");
            }
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid ID format.");
        }
    }

    public String update(String idStr, String body) {
        try {
            UUID id = UUID.fromString(idStr);
            User user = gson.fromJson(body, User.class);
            user.setId(id);

            boolean updated = userService.updateUser(user);
            if (updated) {
                return gson.toJson("User updated successfully.");
            } else {
                return gson.toJson("Failed to update user.");
            }
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid ID format.");
        }
    }

    public String delete(String idStr) {
        try {
            UUID id = UUID.fromString(idStr);
            boolean deleted = userService.deleteUser(id);

            if (deleted) {
                return gson.toJson("User deleted successfully.");
            } else {
                return gson.toJson("User not found.");
            }
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid ID format.");
        }
    }
}
