package com.ti2cc.api.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.UUID;

import javax.sql.DataSource;

import com.ti2cc.api.model.User;

public class SessionDAO {
    private final DataSource dataSource;

    public SessionDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public boolean create(UUID sessionId, UUID userId, Duration duration) {
        String query = "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, NOW() + ?::interval)";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, sessionId);
            pstmt.setObject(2, userId);
            pstmt.setString(3, duration.toSeconds() + " seconds");

            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Fail to create session: " + e.getMessage());
            return false;
        }
    }

    /**
     * Retorna o dono da sessão se ela ainda não expirou, renovando a validade no mesmo comando.
     */
    public User findUserAndRenew(UUID sessionId, Duration duration) {
        String query = "UPDATE sessions s SET expires_at = NOW() + ?::interval "
                + "FROM users u "
                + "WHERE s.id = ? AND s.expires_at > NOW() AND u.id = s.user_id "
                + "RETURNING u.id, u.name, u.email, u.created_at";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, duration.toSeconds() + " seconds");
            pstmt.setObject(2, sessionId);

            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                User user = new User(
                        (UUID) rs.getObject("id"),
                        rs.getString("name"),
                        rs.getString("email")
                );
                user.setCreatedAt(rs.getObject("created_at", OffsetDateTime.class));
                return user;
            }
        } catch (SQLException e) {
            System.err.println("Fail to retrieve session: " + e.getMessage());
        }

        return null;
    }

    public void delete(UUID sessionId) {
        String query = "DELETE FROM sessions WHERE id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, sessionId);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Fail to delete session: " + e.getMessage());
        }
    }

    public void deleteExpired() {
        String query = "DELETE FROM sessions WHERE expires_at <= NOW()";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Fail to delete expired sessions: " + e.getMessage());
        }
    }
}
