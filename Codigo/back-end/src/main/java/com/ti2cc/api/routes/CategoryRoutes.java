package com.ti2cc.api.routes;

import com.ti2cc.api.controller.CategoryController;

import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.path;
import static spark.Spark.post;
import static spark.Spark.put;

public class CategoryRoutes {

    private final CategoryController controller;

    public CategoryRoutes(CategoryController controller) {
        this.controller = controller;
    }

    public void register() {
        path("/categories", () -> {
            post("", controller::create);
            get("", controller::listByUser);
            get("/paginated", controller::listByUserPaginated);
            get("/:category_id", controller::getById);
            put("/:category_id", controller::update);
            delete("/:category_id", controller::delete);
        });
    }
}
