package com.ti2cc.api.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import javax.sql.DataSource;

import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Chat;

public class ChatDAO {
    private final DataSource dataSource;

    public ChatDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public boolean create(Chat chat) {
        String query = "INSERT INTO chat (id, name, user_id) VALUES (?, ?, ?)";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(query)) {
            if (chat.getId() == null) {
                chat.setId(UUID.randomUUID());
            }

            pstmt.setObject(1, chat.getId());
            pstmt.setString(2, chat.getName());
            pstmt.setObject(3, chat.getUserId());

            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Fail to insert chat: " + e.getMessage());
            return false;
        }
    }

    public boolean update(Chat chat) {
        String query = "UPDATE chat SET name = ?, updated_at = NOW() WHERE id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, chat.getName());
            pstmt.setObject(2, chat.getId());

            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Fail to update chat: " + e.getMessage());
            return false;
        }
    }

    public boolean delete(UUID chatId) {
        String query = "DELETE FROM chat WHERE id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, chatId);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Fail to delete chat: " + e.getMessage());
            return false;
        }
    }

    public Chat getById(UUID chatId) {
        String query = "SELECT id, name, user_id, created_at, updated_at FROM chat WHERE id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, chatId);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapChat(rs);
            }
        } catch (SQLException e) {
            System.err.println("Fail to fetch chat: " + e.getMessage());
        }

        return null;
    }

    public Chat findMostRecentByUser(UUID userId) {
        String query = "SELECT id, name, user_id, created_at, updated_at FROM chat "
                + "WHERE user_id = ? ORDER BY updated_at DESC, created_at DESC LIMIT 1";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, userId);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapChat(rs);
            }
        } catch (SQLException e) {
            System.err.println("Fail to fetch most recent chat: " + e.getMessage());
        }

        return null;
    }

    public PaginatedResponseDTO<Chat> listByUser(UUID userId, PaginationRequestDTO pagination) {
        List<Chat> chats = new ArrayList<>();
        long totalItems = 0;

        try (Connection connection = dataSource.getConnection();
             PreparedStatement countStmt = connection
                .prepareStatement("SELECT COUNT(*) FROM chat WHERE user_id = ?")) {
            countStmt.setObject(1, userId);
            ResultSet countResult = countStmt.executeQuery();
            if (countResult.next()) {
                totalItems = countResult.getLong(1);
            }
        } catch (SQLException e) {
            System.err.println("Fail to count chats: " + e.getMessage());
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        String dataQuery = "SELECT id, name, user_id, created_at, updated_at FROM chat "
                + "WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement dataStmt = connection.prepareStatement(dataQuery)) {
            dataStmt.setObject(1, userId);
            dataStmt.setInt(2, pagination.getPageLimit());
            dataStmt.setInt(3, pagination.getOffset());

            ResultSet rs = dataStmt.executeQuery();
            while (rs.next()) {
                chats.add(mapChat(rs));
            }
        } catch (SQLException e) {
            System.err.println("Fail to list chats: " + e.getMessage());
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        return new PaginatedResponseDTO<>(chats, totalItems, pagination.getPage(), pagination.getPageLimit());
    }

    private Chat mapChat(ResultSet rs) throws SQLException {
        Chat chat = new Chat();
        chat.setId((UUID) rs.getObject("id"));
        chat.setName(rs.getString("name"));
        chat.setUserId((UUID) rs.getObject("user_id"));
        chat.setCreatedAt(rs.getObject("created_at", java.time.OffsetDateTime.class));
        chat.setUpdatedAt(rs.getObject("updated_at", java.time.OffsetDateTime.class));
        return chat;
    }
}
