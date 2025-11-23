package com.ti2cc.api.controller;

import com.google.gson.Gson;
import com.ti2cc.api.model.User;
import com.ti2cc.api.service.UserService;
import com.ti2cc.api.util.UuidUtils;

import java.util.UUID;

import spark.Request;
import spark.Response;

public class UserController {

    private final UserService userService;
    private final Gson gson = new Gson();

    public UserController(UserService userService) {
        this.userService = userService;
    }

    public Object create(Request req, Response res) {
        res.type("application/json");
        try {
            User user = gson.fromJson(req.body(), User.class);
            boolean created = userService.createUser(user);

            if (created) {
                res.status(201);
                return gson.toJson(user);
            }

            res.status(400);
            return gson.toJson("Failed to create user.");
        } catch (Exception e) {
            res.status(400);
            return gson.toJson("Invalid request body: " + e.getMessage());
        }
    }

    public Object getAll(Request req, Response res) {
        res.type("application/json");
        res.status(200);
        return gson.toJson(userService.listAllUsers());
    }

    public Object getById(Request req, Response res) {
        res.type("application/json");
        try {
            UUID id = parseUserId(req.params(":id"));
            User user = userService.findUserById(id);

            if (user != null) {
                res.status(200);
                return gson.toJson(user);
            }

            res.status(404);
            return gson.toJson("User not found.");
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid ID format.");
        }
    }

    public Object update(Request req, Response res) {
        res.type("application/json");
        try {
            UUID id = parseUserId(req.params(":id"));
            User user = gson.fromJson(req.body(), User.class);
            user.setId(id);

            boolean updated = userService.updateUser(user);

            if (updated) {
                User updatedUser = userService.findUserById(id);
                res.status(200);
                return gson.toJson(updatedUser);
            }

            res.status(400);
            return gson.toJson("Failed to update user.");
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid ID format.");
        } catch (Exception e) {
            res.status(400);
            return gson.toJson("Error updating user: " + e.getMessage());
        }
    }

    public Object delete(Request req, Response res) {
        res.type("application/json");
        try {
            UUID id = parseUserId(req.params(":id"));
            boolean deleted = userService.deleteUser(id);

            if (deleted) {
                res.status(200);
                return gson.toJson("User deleted successfully.");
            }

            res.status(404);
            return gson.toJson("User not found.");
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid ID format.");
        } catch (Exception e) {
            res.status(400);
            return gson.toJson("Error deleting user: " + e.getMessage());
        }
    }

    private UUID parseUserId(String idStr) {
        try {
            return UUID.fromString(idStr);
        } catch (IllegalArgumentException e) {
            return UuidUtils.fromFirebaseUid(idStr);
        }
    }
}
