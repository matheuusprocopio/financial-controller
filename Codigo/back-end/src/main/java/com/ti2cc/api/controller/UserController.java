package com.ti2cc.api.controller;

import java.util.List;
import java.util.UUID;

import com.google.gson.Gson;
import com.ti2cc.api.model.User;
import com.ti2cc.api.service.UserService;
import com.ti2cc.api.util.GsonUtil;
import com.ti2cc.api.util.UuidUtils;

import spark.Request;
import spark.Response;

public class UserController {

    private final UserService userService;
    private final Gson gson = GsonUtil.getGson();

    public UserController(UserService userService) {
        this.userService = userService;
    }

    public Object create(Request req, Response res) {
        res.type("application/json");
        try {
            User sessionUser = req.attribute("user");
            if (sessionUser == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }

            User existing = userService.findUserById(sessionUser.getId());
            if (existing != null) {
                res.status(200);
                return gson.toJson(existing);
            }

            User user = new User(sessionUser.getId(), sessionUser.getName(), sessionUser.getEmail());
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
        User sessionUser = req.attribute("user");
        if (sessionUser == null) {
            res.status(401);
            return gson.toJson("Usuário não autenticado.");
        }

        // Cada usuário só enxerga a si mesmo
        User user = userService.findUserById(sessionUser.getId());
        res.status(200);
        return gson.toJson(user != null ? List.of(user) : List.of());
    }

    public Object getById(Request req, Response res) {
        res.type("application/json");
        try {
            UUID id = parseUserId(req.params(":id"));
            User sessionUser = req.attribute("user");
            if (sessionUser == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }

            if (!id.equals(sessionUser.getId())) {
                res.status(403);
                return gson.toJson("Access denied.");
            }

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
            User sessionUser = req.attribute("user");
            if (sessionUser == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }

            if (sessionUser.getId() != null && !sessionUser.getId().equals(id)) {
                res.status(403);
                return gson.toJson("Access denied.");
            }

            User user = gson.fromJson(req.body(), User.class);
            user.setId(sessionUser.getId() != null ? sessionUser.getId() : id);
            if (user.getEmail() == null) {
                user.setEmail(sessionUser.getEmail());
            }
            if (user.getName() == null) {
                user.setName(sessionUser.getName());
            }

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
            User sessionUser = req.attribute("user");
            if (sessionUser == null) {
                res.status(401);
                return gson.toJson("Usuário não autenticado.");
            }

            if (sessionUser.getId() != null && !sessionUser.getId().equals(id)) {
                res.status(403);
                return gson.toJson("Access denied.");
            }

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
