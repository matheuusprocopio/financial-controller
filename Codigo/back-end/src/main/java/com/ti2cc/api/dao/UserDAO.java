package com.ti2cc.api.dao;

import com.ti2cc.api.model.User;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserDAO {
    private Connection connection;

    public UserDAO(Connection conn) {
        this.connection = conn;
    }

    public boolean create(User user) {
        String query = "INSERT INTO users (name, email) VALUES (?, ?)";

        try (PreparedStatement pstmt = connection.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setString(1, user.getName());
            pstmt.setString(2, user.getEmail());

            int rowsAffected = pstmt.executeUpdate();

            if (rowsAffected > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        user.setId(generatedKeys.getInt(1));
                    }
                }
            }

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
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("email")
                ));
            }
        } catch (SQLException e) {
            System.err.println("Fail to retrieve users: " + e.getMessage());
        }

        return users;
    }

    public User getById(int id) {
        String query = "SELECT * FROM users WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, id);

            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return new User(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("email")
                );
            }
        } catch (SQLException e) {
            System.err.println("Fail to retrieve user by ID: " + e.getMessage());
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

            pstmt.setInt(paramIndex, user.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Fail to update user: " + e.getMessage());
            return false;
        }
    }

    public boolean delete(int id) {
        String query = "DELETE FROM users WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, id);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Fail to delete user: " + e.getMessage());
            return false;
        }
    }
}