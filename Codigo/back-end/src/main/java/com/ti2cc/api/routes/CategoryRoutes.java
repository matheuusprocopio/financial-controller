package com.ti2cc.api.routes;

import com.ti2cc.api.controller.CategoryController;

import static spark.Spark.*;

public class CategoryRoutes {

    private final CategoryController controller;

    public CategoryRoutes(CategoryController controller) {
        this.controller = controller;
    }

    public void register() {
        path("/categories", () -> {
            post("", (req, res) -> {
                res.type("application/json");
                res.status(201);
                return controller.create(req.body());
            });

            get("", (req, res) -> {
                res.type("application/json");
                return controller.getAll();
            });

            get("/:id", (req, res) -> {
                res.type("application/json");
                return controller.getById(req.params(":id"));
            });

            put("/:id", (req, res) -> {
                res.type("application/json");
                return controller.update(req.params(":id"), req.body());
            });

            delete("/:id", (req, res) -> {
                res.type("application/json");
                return controller.delete(req.params(":id"));
            });
        });
    }
}