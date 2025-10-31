package com.ti2cc.api.service;

import com.ti2cc.api.model.User;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class SessionService {
    private static final Map<String, User> sessions = new ConcurrentHashMap<>();
    private static final Map<String, Long> sessionExpiry = new ConcurrentHashMap<>();
    private static final long SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas em milliseconds

    /**
     * Cria uma nova sessão para o usuário
     * @param user Usuário autenticado
     * @return ID da sessão
     */
    public String createSession(User user) {
        String sessionId = UUID.randomUUID().toString();
        sessions.put(sessionId, user);
        sessionExpiry.put(sessionId, System.currentTimeMillis() + SESSION_DURATION);
        return sessionId;
    }

    /**
     * Obtém o usuário associado à sessão
     * @param sessionId ID da sessão
     * @return User se a sessão for válida, null caso contrário
     */
    public User getSession(String sessionId) {
        if (sessionId == null || sessionId.isEmpty()) {
            return null;
        }

        Long expiry = sessionExpiry.get(sessionId);
        if (expiry == null || System.currentTimeMillis() > expiry) {
            // Sessão expirada ou inválida
            sessions.remove(sessionId);
            sessionExpiry.remove(sessionId);
            return null;
        }

        // Renova a sessão a cada acesso
        sessionExpiry.put(sessionId, System.currentTimeMillis() + SESSION_DURATION);
        return sessions.get(sessionId);
    }

    /**
     * Remove uma sessão
     * @param sessionId ID da sessão
     */
    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
        sessionExpiry.remove(sessionId);
    }

    /**
     * Verifica se uma sessão é válida
     * @param sessionId ID da sessão
     * @return true se a sessão for válida, false caso contrário
     */
    public boolean isValidSession(String sessionId) {
        return getSession(sessionId) != null;
    }
}

