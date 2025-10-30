package com.ti2cc.api.routes;

import com.ti2cc.api.controller.AccountController;

import static spark.Spark.*;

public class AccountRoutes {

    private final AccountController controller;

    public AccountRoutes(AccountController controller) {
        this.controller = controller;
    }

    public void register() {
        path("/accounts", () -> {
            post("", (req, res) -> {
                res.type("application/json");
                res.status(201);
                return controller.create(req.body());
            });

            get("/:id", (req, res) -> {
                res.type("application/json");
                res.status(200);
                return controller.getById(req.params(":id"));
            });

            get("/user/:userId", (req, res) -> {
                res.type("application/json");
                res.status(200);
                return controller.getByUserId(req.params(":userId"));
            });

            delete("/:id", (req, res) -> {
                res.type("application/json");
                res.status(200);
                return controller.delete(req.params(":id"));
            });
        });
    }
}
