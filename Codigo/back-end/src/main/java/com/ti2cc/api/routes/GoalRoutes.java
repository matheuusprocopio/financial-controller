package com.ti2cc.api.routes;

import com.ti2cc.api.controller.GoalController;

import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.path;
import static spark.Spark.post;
import static spark.Spark.put;

public class GoalRoutes {

    private final GoalController controller;

    public GoalRoutes(GoalController controller) {
        this.controller = controller;
    }

    public void register() {
        path("/goals", () -> {
            post("", controller::create);
            get("", controller::list);
            get("/:goalId", controller::getById);
            put("/:goalId", controller::update);
            delete("/:goalId", controller::delete);
        });
    }
}
