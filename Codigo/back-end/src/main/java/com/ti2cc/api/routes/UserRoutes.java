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
            post("", controller::create);
            get("", controller::getAll);
            get("/:id", controller::getById);
            put("/:id", controller::update);
            delete("/:id", controller::delete);
        });
    }
}