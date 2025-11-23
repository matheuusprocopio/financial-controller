package com.ti2cc.api.routes;

import com.ti2cc.api.controller.AuthController;
import static spark.Spark.*;

public class AuthRoutes {

    private final AuthController controller;

    public AuthRoutes(AuthController controller) {
        this.controller = controller;
    }

    public void register() {
        path("/auth", () -> {
            post("/login", controller::login);
            get("/validate", controller::validateSession);
            post("/logout", controller::logout);
        });
    }
}

