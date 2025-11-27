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
            post("", controller::create);
            get("", controller::list);
            get("/:itemId", controller::getById);
            get("/user/:userId", controller::listByUserPath);
            get("/category/:categoryId", controller::getByCategoryId);
            get("/account/:accountId", controller::getByAccountId);
            put("/:itemId", controller::update);
            delete("/:itemId", controller::delete);
            post("/analytics", controller::analytics);
        });
    }
}
