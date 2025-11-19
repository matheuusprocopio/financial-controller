package com.ti2cc.api.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.google.gson.JsonParser;
import com.ti2cc.api.model.Message;

public class MessageDAO {
    private final Connection connection;

    public MessageDAO(Connection connection) {
        this.connection = connection;
    }

    public boolean create(Message message) {
        String query = "INSERT INTO messages (id, chat_id, role, parts) VALUES (?, ?, ?, ?::jsonb)";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            UUID messageId = message.getId() != null ? message.getId() : UUID.randomUUID();
            message.setId(messageId);

            pstmt.setObject(1, messageId);
            pstmt.setObject(2, message.getChatId());
            pstmt.setString(3, message.getRole());

            if (message.getParts() != null) {
                pstmt.setString(4, message.getParts().toString());
            } else {
                pstmt.setNull(4, Types.OTHER);
            }

            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Fail to insert message: " + e.getMessage());
            return false;
        }
    }

    public List<Message> listByChatId(UUID chatId) {
        List<Message> messages = new ArrayList<>();
        String dataQuery = "SELECT id, chat_id, role, parts, created_at FROM messages WHERE chat_id = ? "
                + "ORDER BY created_at ASC";

        try (PreparedStatement dataStmt = connection.prepareStatement(dataQuery)) {
            dataStmt.setObject(1, chatId);

            ResultSet rs = dataStmt.executeQuery();
            while (rs.next()) {
                messages.add(mapMessage(rs));
            }
            return messages;
        } catch (SQLException e) {
            System.err.println("Fail to list messages: " + e.getMessage());
            return List.of();
        }
    }

    private Message mapMessage(ResultSet rs) throws SQLException {
        Message message = new Message();
        message.setId((UUID) rs.getObject("id"));
        message.setChatId((UUID) rs.getObject("chat_id"));
        message.setRole(rs.getString("role"));

        String partsJson = rs.getString("parts");
        if (partsJson != null) {
            message.setParts(JsonParser.parseString(partsJson));
        }

        OffsetDateTime createdAt = rs.getObject("created_at", OffsetDateTime.class);
        message.setCreatedAt(createdAt);
        return message;
    }
}
