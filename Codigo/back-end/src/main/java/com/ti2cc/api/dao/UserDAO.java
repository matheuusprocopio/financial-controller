package com.ti2cc.api.dao;

import com.ti2cc.api.model.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class UserDAO {
    private Connection connection;

    public UserDAO(Connection conn) {
        this.connection = conn;
    }

    public boolean create(User user) {
        if (user.getId() == null) {
            user.setId(UUID.randomUUID());
        }

        String query = "INSERT INTO users (id, name, email) VALUES (?, ?, ?)";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, user.getId());
            pstmt.setString(2, user.getName());
            pstmt.setString(3, user.getEmail());

            int rowsAffected = pstmt.executeUpdate();

            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Fail to insert new user: " + e.getMessage());
            return false;
        }
    }

    public List<User> getAll() {
        List<User> users = new ArrayList<>();
        String query = "SELECT * FROM users ORDER BY id ASC";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                users.add(new User(
                        (UUID) rs.getObject("id"),
                        rs.getString("name"),
                        rs.getString("email")
                ));
            }
        } catch (SQLException e) {
            System.err.println("Fail to retrieve users: " + e.getMessage());
        }

        return users;
    }

    public User getById(UUID id) {
        String query = "SELECT * FROM users WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, id);

            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return new User(
                        (UUID) rs.getObject("id"),
                        rs.getString("name"),
                        rs.getString("email")
                );
            }
        } catch (SQLException e) {
            System.err.println("Fail to retrieve user by ID: " + e.getMessage());
        }

        return null;
    }

    public User findByEmail(String email) {
        String query = "SELECT * FROM users WHERE email = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, email);

            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return new User(
                        (UUID) rs.getObject("id"),
                        rs.getString("name"),
                        rs.getString("email")
                );
            }
        } catch (SQLException e) {
            System.err.println("Fail to retrieve user by email: " + e.getMessage());
        }

        return null;
    }

    public boolean update(User user) {
        StringBuilder sb = new StringBuilder("UPDATE users SET ");
        boolean hasPrev = false;

        if (user.getName() != null) {
            sb.append("name = ?");
            hasPrev = true;
        }

        if (user.getEmail() != null) {
            if (hasPrev) sb.append(", ");
            sb.append("email = ?");
        }

        sb.append(" WHERE id = ?");

        try (PreparedStatement pstmt = connection.prepareStatement(sb.toString())) {
            int paramIndex = 1;

            if (user.getName() != null)
                pstmt.setString(paramIndex++, user.getName());

            if (user.getEmail() != null)
                pstmt.setString(paramIndex++, user.getEmail());

            pstmt.setObject(paramIndex, user.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Fail to update user: " + e.getMessage());
            return false;
        }
    }

    public boolean delete(UUID id) {
        String query = "DELETE FROM users WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, id);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Fail to delete user: " + e.getMessage());
            return false;
        }
    }
}
