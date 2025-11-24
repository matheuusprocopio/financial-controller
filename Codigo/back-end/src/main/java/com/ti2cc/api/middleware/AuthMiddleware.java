package com.ti2cc.api.middleware;

import com.ti2cc.api.model.User;
import com.ti2cc.api.service.SessionService;
import spark.Request;
import spark.Response;

import static spark.Spark.halt;

public class AuthMiddleware {

    private final SessionService sessionService;

    public AuthMiddleware(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    public User requireValidSession(Request request, Response response) {
        String sessionId = request.headers("X-Session-Id");

        if (sessionId == null || sessionId.isEmpty()) {
            unauthorized(response, "Não autenticado. Session ID não fornecido.");
        }

        User user = sessionService.getSession(sessionId);
        if (user == null) {
            unauthorized(response, "Sessão inválida ou expirada.");
        }

        attachUserToRequest(request, user, sessionId);
        return user;
    }

    private void unauthorized(Response response, String message) {
        response.status(401);
        response.type("application/json");
        response.body("{\"error\":\"" + message + "\"}");
        halt(401, response.body());
    }

    /**
     * Adiciona o usuário e claims da sessão como atributos da requisição.
     */
    private void attachUserToRequest(Request request, User user, String sessionId) {
        request.attribute("user", user);
        request.attribute("userId", user.getId());
        request.attribute("userEmail", user.getEmail());
        request.attribute("userName", user.getName());
        request.attribute("sessionId", sessionId);
    }
}
