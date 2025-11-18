package com.ti2cc.api.service;

import com.ti2cc.api.model.User;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class SessionService {
    private static final Map<String, User> sessions = new ConcurrentHashMap<>();
    private static final Map<String, Long> sessionExpiry = new ConcurrentHashMap<>();
    private static final long SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas em milliseconds

    public String createSession(User user) {
        String sessionId = UUID.randomUUID().toString();
        sessions.put(sessionId, user);
        sessionExpiry.put(sessionId, System.currentTimeMillis() + SESSION_DURATION);
        return sessionId;
    }

    public User getSession(String sessionId) {
        if (sessionId == null || sessionId.isEmpty()) {
            return null;
        }

        Long expiry = sessionExpiry.get(sessionId);
        if (expiry == null || System.currentTimeMillis() > expiry) {
            sessions.remove(sessionId);
            sessionExpiry.remove(sessionId);
            return null;
        }

        // Renova a sessão a cada acesso
        sessionExpiry.put(sessionId, System.currentTimeMillis() + SESSION_DURATION);
        return sessions.get(sessionId);
    }

    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
        sessionExpiry.remove(sessionId);
    }

    public boolean isValidSession(String sessionId) {
        return getSession(sessionId) != null;
    }
}

