package com.ti2cc.api.service;

import com.ti2cc.api.dao.SessionDAO;
import com.ti2cc.api.model.User;
import java.time.Duration;
import java.util.UUID;

/**
 * Sessões ficam no banco para sobreviver a reinícios e deploys do servidor.
 */
public class SessionService {
    private static final Duration SESSION_DURATION = Duration.ofHours(24);

    private final SessionDAO sessionDAO;

    public SessionService(SessionDAO sessionDAO) {
        this.sessionDAO = sessionDAO;
    }

    public String createSession(User user) {
        // Aproveita o login para limpar sessões vencidas
        sessionDAO.deleteExpired();

        UUID sessionId = UUID.randomUUID();
        if (!sessionDAO.create(sessionId, user.getId(), SESSION_DURATION)) {
            throw new RuntimeException("Não foi possível criar a sessão");
        }
        return sessionId.toString();
    }

    public User getSession(String sessionId) {
        UUID id = parseSessionId(sessionId);
        if (id == null) {
            return null;
        }

        // Renova a sessão a cada acesso
        return sessionDAO.findUserAndRenew(id, SESSION_DURATION);
    }

    public void removeSession(String sessionId) {
        UUID id = parseSessionId(sessionId);
        if (id != null) {
            sessionDAO.delete(id);
        }
    }

    public boolean isValidSession(String sessionId) {
        return getSession(sessionId) != null;
    }

    private UUID parseSessionId(String sessionId) {
        if (sessionId == null || sessionId.isEmpty()) {
            return null;
        }

        try {
            return UUID.fromString(sessionId);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
