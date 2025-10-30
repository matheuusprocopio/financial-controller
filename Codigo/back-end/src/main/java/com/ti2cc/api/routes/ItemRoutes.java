package com.ti2cc.api.routes;

import com.ti2cc.api.controller.ItemController;

import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.path;
import static spark.Spark.post;
import static spark.Spark.put;

public class ItemRoutes {

    private final ItemController controller;

    public ItemRoutes(ItemController controller) {
        this.controller = controller;
    }

    public void register() {
        path("/items", () -> {
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

            get("/owner/:ownerId", (req, res) -> {
                res.type("application/json");
                res.status(200);
                return controller.getByOwnerId(req.params(":ownerId"));
            });

            get("/category/:categoryId", (req, res) -> {
                res.type("application/json");
                res.status(200);
                return controller.getByCategoryId(req.params(":categoryId"));
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
