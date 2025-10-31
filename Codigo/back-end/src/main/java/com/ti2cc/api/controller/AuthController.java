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

import java.util.UUID;

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

    /**
     * Processa login com email/senha ou Google Sign-In
     * O cliente deve autenticar no Firebase primeiro e enviar o idToken
     */
    public String login(String body) {
        try {
            // Verifica se Firebase está inicializado
            if (firebaseAuthService == null || !firebaseAuthService.isInitialized()) {
                return gson.toJson(new AuthResponseDTO(false, "Firebase não está configurado. Configure as credenciais no .env"));
            }

            LoginRequestDTO loginRequest = gson.fromJson(body, LoginRequestDTO.class);

            if (loginRequest == null) {
                return gson.toJson(new AuthResponseDTO(false, "Requisição inválida"));
            }

            // Valida que tem token ou email/password
            if (loginRequest.getIdToken() == null || loginRequest.getIdToken().isEmpty()) {
                return gson.toJson(new AuthResponseDTO(false, "Token ID do Firebase é obrigatório"));
            }

            // Verifica o token no Firebase
            FirebaseToken decodedToken;
            try {
                decodedToken = firebaseAuthService.verifyIdToken(loginRequest.getIdToken());
            } catch (FirebaseAuthException e) {
                return gson.toJson(new AuthResponseDTO(false, "Token inválido ou expirado: " + e.getMessage()));
            } catch (RuntimeException e) {
                return gson.toJson(new AuthResponseDTO(false, e.getMessage()));
            }

            // Extrai informações do usuário do token
            String email = decodedToken.getEmail();
            if (email == null || email.isEmpty()) {
                return gson.toJson(new AuthResponseDTO(false, "Email não encontrado no token"));
            }

            // Busca ou cria o usuário no banco de dados
            User user = userService.findUserByEmail(email);
            
            if (user == null) {
                // Cria novo usuário no banco com informações do Firebase
                String name = decodedToken.getName();
                if (name == null || name.isEmpty()) {
                    // Usa email sem domínio como nome padrão
                    if (email.contains("@")) {
                        name = email.substring(0, email.indexOf("@"));
                    } else {
                        name = "User";
                    }
                }

                user = new User(UUID.randomUUID(), name, email);
                boolean created = userService.createUser(user);
                
                if (!created) {
                    return gson.toJson(new AuthResponseDTO(false, "Falha ao criar usuário no sistema"));
                }
            } else {
                // Atualiza o nome se necessário (pode ter mudado no Firebase)
                String name = decodedToken.getName();
                if (name != null && !name.isEmpty() && !name.equals(user.getName())) {
                    user.setName(name);
                    userService.updateUser(user);
                }
            }

            // Cria sessão
            String sessionId = sessionService.createSession(user);

            return gson.toJson(new AuthResponseDTO(true, "Login realizado com sucesso", user, sessionId));

        } catch (Exception e) {
            System.err.println("Erro ao processar login: " + e.getMessage());
            e.printStackTrace();
            return gson.toJson(new AuthResponseDTO(false, "Erro interno: " + e.getMessage()));
        }
    }

    /**
     * Verifica se uma sessão é válida
     */
    public String validateSession(String sessionId) {
        User user = sessionService.getSession(sessionId);
        
        if (user != null) {
            return gson.toJson(new AuthResponseDTO(true, "Sessão válida", user, sessionId));
        } else {
            return gson.toJson(new AuthResponseDTO(false, "Sessão inválida ou expirada"));
        }
    }

    /**
     * Faz logout removendo a sessão
     */
    public String logout(String sessionId) {
        sessionService.removeSession(sessionId);
        return gson.toJson(new AuthResponseDTO(true, "Logout realizado com sucesso"));
    }
}

