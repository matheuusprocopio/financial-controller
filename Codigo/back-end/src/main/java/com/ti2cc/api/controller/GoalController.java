package com.ti2cc.api.controller;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonObject;
import com.google.gson.JsonSerializer;
import com.google.gson.JsonSyntaxException;
import com.ti2cc.api.dto.CreateGoalDTO;
import com.ti2cc.api.dto.GoalUpdateDTO;
import com.ti2cc.api.model.Goal;
import com.ti2cc.api.model.User;
import com.ti2cc.api.service.GoalService;

import spark.Request;
import spark.Response;

public class GoalController {

    private final GoalService goalService;
    private final Gson gson;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
        this.gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, (JsonDeserializer<LocalDate>) (json, type, context) -> {
                    String raw = json.getAsString();
                    try {
                        return LocalDate.parse(raw.length() > 10 ? raw.substring(0, 10) : raw);
                    } catch (DateTimeParseException e) {
                        throw new IllegalArgumentException("Invalid date format. Expected ISO (yyyy-MM-dd).");
                    }
                })
                .registerTypeAdapter(LocalDate.class,
                        (JsonSerializer<LocalDate>) (value, type, context) -> context.serialize(value != null ? value.toString() : null))
                .registerTypeAdapter(OffsetDateTime.class,
                        (JsonSerializer<OffsetDateTime>) (value, type, context) ->
                                context.serialize(value != null ? value.toString() : null))
                .registerTypeAdapter(OffsetDateTime.class,
                        (JsonDeserializer<OffsetDateTime>) (json, type, context) ->
                                json == null || json.isJsonNull() || json.getAsString().isBlank()
                                        ? null
                                        : OffsetDateTime.parse(json.getAsString()))
                .create();
    }

    public Object create(Request req, Response res) {
        res.type("application/json");
        User sessionUser = req.attribute("user");
        if (sessionUser == null || sessionUser.getId() == null) {
            res.status(401);
            return gson.toJson("Usuário não autenticado.");
        }

        try {
            CreateGoalDTO dto = gson.fromJson(req.body(), CreateGoalDTO.class);
            if (dto == null) {
                res.status(400);
                return gson.toJson("Request body is required.");
            }

            UUID goalId = goalService.createGoal(sessionUser.getId(), dto);
            if (goalId == null) {
                res.status(400);
                return gson.toJson("Não foi possível criar a meta.");
            }

            Goal created = goalService.findById(goalId);
            res.status(201);
            return gson.toJson(created);
        } catch (JsonSyntaxException | IllegalArgumentException e) {
            res.status(400);
            return gson.toJson(e.getMessage());
        }
    }

    public Object list(Request req, Response res) {
        res.type("application/json");
        User sessionUser = req.attribute("user");
        if (sessionUser == null || sessionUser.getId() == null) {
            res.status(401);
            return gson.toJson("Usuário não autenticado.");
        }

        List<Goal> goals = goalService.listByUser(sessionUser.getId());
        res.status(200);
        return gson.toJson(goals);
    }

    public Object getById(Request req, Response res) {
        res.type("application/json");
        User sessionUser = req.attribute("user");
        if (sessionUser == null || sessionUser.getId() == null) {
            res.status(401);
            return gson.toJson("Usuário não autenticado.");
        }

        try {
            UUID goalId = UUID.fromString(req.params(":goalId"));
            Goal goal = goalService.findById(goalId);
            if (goal == null) {
                res.status(404);
                return gson.toJson("Meta não encontrada.");
            }

            if (!sessionUser.getId().equals(goal.getUserId())) {
                res.status(403);
                return gson.toJson("Acesso negado.");
            }

            res.status(200);
            return gson.toJson(goal);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("UUID inválido.");
        }
    }

    public Object update(Request req, Response res) {
        res.type("application/json");
        User sessionUser = req.attribute("user");
        if (sessionUser == null || sessionUser.getId() == null) {
            res.status(401);
            return gson.toJson("Usuário não autenticado.");
        }

        try {
            UUID goalId = UUID.fromString(req.params(":goalId"));
            Goal goal = goalService.findById(goalId);
            if (goal == null) {
                res.status(404);
                return gson.toJson("Meta não encontrada.");
            }

            if (!sessionUser.getId().equals(goal.getUserId())) {
                res.status(403);
                return gson.toJson("Acesso negado.");
            }

            JsonObject payload = gson.fromJson(req.body(), JsonObject.class);
            if (payload == null || payload.entrySet().isEmpty()) {
                res.status(400);
                return gson.toJson("Nenhum campo informado para atualização.");
            }

            GoalUpdateDTO dto = gson.fromJson(payload, GoalUpdateDTO.class);
            boolean hasChanges = false;

            if (payload.has("title")) {
                goal.setTitle(dto.getTitle());
                hasChanges = true;
            }

            if (payload.has("description")) {
                goal.setDescription(dto.getDescription());
                hasChanges = true;
            }

            if (payload.has("targetAmount")) {
                goal.setTargetAmount(dto.getTargetAmount());
                hasChanges = true;
            }

            if (payload.has("deadline")) {
                goal.setDeadline(dto.getDeadline());
                hasChanges = true;
            }

            if (payload.has("accountId")) {
                goal.setAccountId(dto.getAccountId());
                hasChanges = true;
            }

            if (!hasChanges) {
                res.status(400);
                return gson.toJson("Nenhum campo válido informado para atualização.");
            }

            boolean updated = goalService.updateGoal(goal);
            if (!updated) {
                res.status(400);
                return gson.toJson("Não foi possível atualizar a meta.");
            }

            Goal refreshed = goalService.findById(goalId);
            res.status(200);
            return gson.toJson(refreshed);
        } catch (JsonSyntaxException e) {
            res.status(400);
            return gson.toJson("JSON inválido: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("UUID inválido.");
        }
    }

    public Object delete(Request req, Response res) {
        res.type("application/json");
        User sessionUser = req.attribute("user");
        if (sessionUser == null || sessionUser.getId() == null) {
            res.status(401);
            return gson.toJson("Usuário não autenticado.");
        }

        try {
            UUID goalId = UUID.fromString(req.params(":goalId"));
            Goal goal = goalService.findById(goalId);
            if (goal == null) {
                res.status(404);
                return gson.toJson("Meta não encontrada.");
            }

            if (!sessionUser.getId().equals(goal.getUserId())) {
                res.status(403);
                return gson.toJson("Acesso negado.");
            }

            boolean deleted = goalService.deleteGoal(goalId);
            if (!deleted) {
                res.status(400);
                return gson.toJson("Não foi possível excluir a meta.");
            }

            res.status(200);
            return gson.toJson("Meta excluída com sucesso.");
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("UUID inválido.");
        }
    }
}
