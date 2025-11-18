package com.ti2cc.api.middleware;

import com.ti2cc.api.service.SessionService;
import spark.Request;
import spark.Response;

public class AuthMiddleware {

    private final SessionService sessionService;

    public AuthMiddleware(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    public boolean validateSession(Request request, Response response) {
        String sessionId = request.headers("X-Session-Id");
        
        if (sessionId == null || sessionId.isEmpty()) {
            response.status(401);
            response.type("application/json");
            response.body("{\"error\":\"Não autenticado. Session ID não fornecido.\"}");
            return false;
        }

        if (!sessionService.isValidSession(sessionId)) {
            response.status(401);
            response.type("application/json");
            response.body("{\"error\":\"Sessão inválida ou expirada.\"}");
            return false;
        }

        return true;
    }

    /**
     * Adiciona o usuário da sessão como atributo da requisição
     * Deve ser chamado após validateSession retornar true
     */
    public void attachUserToRequest(Request request) {
        String sessionId = request.headers("X-Session-Id");
        if (sessionId != null) {
            request.attribute("user", sessionService.getSession(sessionId));
        }
    }
}

