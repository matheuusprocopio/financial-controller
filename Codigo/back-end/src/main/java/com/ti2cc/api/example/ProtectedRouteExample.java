package com.ti2cc.api.example;

import com.google.gson.Gson;
import com.ti2cc.api.middleware.AuthMiddleware;
import com.ti2cc.api.model.User;
import com.ti2cc.api.service.SessionService;
import static spark.Spark.*;

/**
 * Exemplo de como proteger rotas com autenticação
 * 
 * Para usar este exemplo no seu projeto:
 * 1. Instancie o AuthMiddleware no Container.java
 * 2. Adicione o before() filter nas rotas que precisam de autenticação
 * 3. Acesse o usuário autenticado através de req.attribute("user")
 */
public class ProtectedRouteExample {

    private final AuthMiddleware authMiddleware;
    private final Gson gson = new Gson();

    public ProtectedRouteExample(SessionService sessionService) {
        this.authMiddleware = new AuthMiddleware(sessionService);
    }

    public void registerProtectedRoutes() {
        // Exemplo 1: Proteger todas as rotas de um path
        path("/api/protected", () -> {
            // Este filtro será aplicado a todas as rotas dentro de /api/protected/*
            before("/*", (req, res) -> {
                if (!authMiddleware.validateSession(req, res)) {
                    halt(401); // Para a execução se não autenticado
                }
                authMiddleware.attachUserToRequest(req);
            });

            // Esta rota agora requer autenticação
            get("/me", (req, res) -> {
                res.type("application/json");
                User user = req.attribute("user"); // Usuário da sessão
                return gson.toJson(user);
            });

            // Outras rotas protegidas...
        });

        // Exemplo 2: Proteger rotas específicas individualmente
        get("/api/users/profile", (req, res) -> {
            if (!authMiddleware.validateSession(req, res)) {
                res.status(401);
                return gson.toJson("{\"error\":\"Não autenticado\"}");
            }
            authMiddleware.attachUserToRequest(req);
            
            res.type("application/json");
            User user = req.attribute("user");
            return gson.toJson(user);
        });

        // Exemplo 3: Rotas públicas (sem autenticação)
        get("/api/public/info", (req, res) -> {
            res.type("application/json");
            return gson.toJson("{\"message\":\"Informação pública\"}");
        });
    }
}

