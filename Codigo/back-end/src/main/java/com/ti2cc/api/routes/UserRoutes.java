package com.ti2cc.api.routes;

import com.ti2cc.api.controller.UserController;
import static spark.Spark.*;

public class UserRoutes {

    private final UserController controller;

    public UserRoutes(UserController controller) {
        this.controller = controller;
    }

    public void register() {
        path("/users", () -> {

            post("", (req, res) -> {
                res.type("application/json");
                res.status(201);
                return controller.create(req.body());
            });

            get("", (req, res) -> {
                res.type("application/json");
                res.status(200);
                return controller.getAll();
            });

            get("/:id", (req, res) -> {
                res.type("application/json");
                res.status(200);
                return controller.getById(req.params(":id"));
            });

            put("/:id", (req, res) -> {
                res.type("application/json");
                res.status(200);
                return controller.update(req.params(":id"), req.body());
            });

            delete("/:id", (req, res) -> {
                res.type("application/json");
                res.status(200);
                return controller.delete(req.params(":id"));
            });
        });
    }
}