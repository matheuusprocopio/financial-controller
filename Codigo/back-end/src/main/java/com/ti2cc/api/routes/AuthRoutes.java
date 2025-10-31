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

            post("/login", (req, res) -> {
                res.type("application/json");
                String response = controller.login(req.body());
                
                // Se login foi bem-sucedido, retorna 200, senão 401
                if (response.contains("\"success\":true")) {
                    res.status(200);
                } else {
                    res.status(401);
                }
                
                return response;
            });

            get("/validate", (req, res) -> {
                res.type("application/json");
                String sessionId = req.headers("X-Session-Id");
                
                if (sessionId == null || sessionId.isEmpty()) {
                    res.status(401);
                    return "{\"success\":false,\"message\":\"Session ID não fornecido\"}";
                }
                
                String response = controller.validateSession(sessionId);
                
                if (response.contains("\"success\":true")) {
                    res.status(200);
                } else {
                    res.status(401);
                }
                
                return response;
            });

            post("/logout", (req, res) -> {
                res.type("application/json");
                String sessionId = req.headers("X-Session-Id");
                
                if (sessionId == null || sessionId.isEmpty()) {
                    res.status(400);
                    return "{\"success\":false,\"message\":\"Session ID não fornecido\"}";
                }
                
                res.status(200);
                return controller.logout(sessionId);
            });
        });
    }
}

