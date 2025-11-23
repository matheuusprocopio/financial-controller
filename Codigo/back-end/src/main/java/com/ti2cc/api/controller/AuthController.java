package com.ti2cc.api.controller;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.gson.Gson;
import com.ti2cc.api.dto.AuthResponseDTO;
import com.ti2cc.api.dto.LoginRequestDTO;
import com.ti2cc.api.model.User;
import com.ti2cc.api.service.FirebaseAuthService;
import com.ti2cc.api.service.SessionService;
import com.ti2cc.api.service.UserService;
import com.ti2cc.api.util.UuidUtils;

import java.util.UUID;

import spark.Request;
import spark.Response;

public class AuthController {

    private final FirebaseAuthService firebaseAuthService;
    private final UserService userService;
    private final SessionService sessionService;
    private final Gson gson = new Gson();

    public AuthController(FirebaseAuthService firebaseAuthService, UserService userService, SessionService sessionService) {
        this.firebaseAuthService = firebaseAuthService;
        this.userService = userService;
        this.sessionService = sessionService;
    }

    public Object login(Request req, Response res) {
        res.type("application/json");
        try {
            if (firebaseAuthService == null || !firebaseAuthService.isInitialized()) {
                res.status(503);
                return gson.toJson(new AuthResponseDTO(false, "Firebase não está configurado. Configure as credenciais no .env"));
            }

            LoginRequestDTO loginRequest = gson.fromJson(req.body(), LoginRequestDTO.class);

            if (loginRequest == null) {
                res.status(400);
                return gson.toJson(new AuthResponseDTO(false, "Requisição inválida"));
            }

            if (loginRequest.getIdToken() == null || loginRequest.getIdToken().isEmpty()) {
                res.status(400);
                return gson.toJson(new AuthResponseDTO(false, "Token ID do Firebase é obrigatório"));
            }

            FirebaseToken decodedToken;
            try {
                decodedToken = firebaseAuthService.verifyIdToken(loginRequest.getIdToken());
            } catch (FirebaseAuthException e) {
                res.status(401);
                return gson.toJson(new AuthResponseDTO(false, "Token inválido ou expirado: " + e.getMessage()));
            } catch (RuntimeException e) {
                res.status(401);
                return gson.toJson(new AuthResponseDTO(false, e.getMessage()));
            }

            String email = decodedToken.getEmail();
            if (email == null || email.isEmpty()) {
                res.status(400);
                return gson.toJson(new AuthResponseDTO(false, "Email não encontrado no token"));
            }

            UUID userId = UuidUtils.fromFirebaseUid(decodedToken.getUid());

            User user = userService.findUserById(userId);

            if (user == null) {
                String name = decodedToken.getName();
                if (name == null || name.isEmpty()) {
                    if (email.contains("@")) {
                        name = email.substring(0, email.indexOf("@"));
                    } else {
                        name = "User";
                    }
                }

                user = new User(userId, name, email);
                boolean created = userService.createUser(user);

                if (!created) {
                    res.status(500);
                    return gson.toJson(new AuthResponseDTO(false, "Falha ao criar usuário no sistema"));
                }
            }

            String sessionId = sessionService.createSession(user);
            res.status(200);
            return gson.toJson(new AuthResponseDTO(true, "Login realizado com sucesso", user, sessionId));

        } catch (Exception e) {
            res.status(500);
            return gson.toJson(new AuthResponseDTO(false, "Erro interno: " + e.getMessage()));
        }
    }

    public Object validateSession(Request req, Response res) {
        res.type("application/json");
        String sessionId = req.headers("X-Session-Id");

        if (sessionId == null || sessionId.isEmpty()) {
            res.status(401);
            return gson.toJson(new AuthResponseDTO(false, "Session ID não fornecido"));
        }

        User user = sessionService.getSession(sessionId);

        if (user != null) {
            res.status(200);
            return gson.toJson(new AuthResponseDTO(true, "Sessão válida", user, sessionId));
        }

        res.status(401);
        return gson.toJson(new AuthResponseDTO(false, "Sessão inválida ou expirada"));
    }

    public Object logout(Request req, Response res) {
        res.type("application/json");
        String sessionId = req.headers("X-Session-Id");

        if (sessionId == null || sessionId.isEmpty()) {
            res.status(400);
            return gson.toJson(new AuthResponseDTO(false, "Session ID não fornecido"));
        }

        sessionService.removeSession(sessionId);
        res.status(200);
        return gson.toJson(new AuthResponseDTO(true, "Logout realizado com sucesso"));
    }
}

