package com.ti2cc.api.dao;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.ti2cc.api.model.Goal;

public class GoalDAO {

    private final Connection connection;

    public GoalDAO(Connection connection) {
        this.connection = connection;
    }

    public boolean create(Goal goal) {
        String sql = "INSERT INTO goals (id, user_id, account_id, title, description, target_amount, current_amount, deadline, achieved) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setObject(1, goal.getId());
            pstmt.setObject(2, goal.getUserId());

            if (goal.getAccountId() != null) {
                pstmt.setObject(3, goal.getAccountId());
            } else {
                pstmt.setNull(3, Types.OTHER);
            }

            pstmt.setString(4, goal.getTitle());

            if (goal.getDescription() != null) {
                pstmt.setString(5, goal.getDescription());
            } else {
                pstmt.setNull(5, Types.VARCHAR);
            }

            pstmt.setDouble(6, goal.getTargetAmount());
            pstmt.setDouble(7, goal.getCurrentAmount() != null ? goal.getCurrentAmount() : 0.0);

            if (goal.getDeadline() != null) {
                pstmt.setDate(8, Date.valueOf(goal.getDeadline()));
            } else {
                pstmt.setNull(8, Types.DATE);
            }

            pstmt.setBoolean(9, goal.isAchieved());

            int rows = pstmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            System.err.println("Fail to insert goal: " + e.getMessage());
            return false;
        }
    }

    public Goal getById(UUID id) {
        String sql = "SELECT * FROM goals WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setObject(1, id);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return mapGoal(rs);
            }
        } catch (SQLException e) {
            System.err.println("Fail to fetch goal by id: " + e.getMessage());
        }
        return null;
    }

    public List<Goal> listByUser(UUID userId) {
        String sql = "SELECT * FROM goals WHERE user_id = ? ORDER BY deadline NULLS LAST, created_at DESC";
        List<Goal> goals = new ArrayList<>();

        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setObject(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                goals.add(mapGoal(rs));
            }
        } catch (SQLException e) {
            System.err.println("Fail to list goals by user: " + e.getMessage());
        }

        return goals;
    }

    public List<Goal> listRelevantForAccount(UUID userId, UUID accountId) {
        String sql = "SELECT * FROM goals WHERE user_id = ? AND (account_id IS NULL OR account_id = ?)";
        List<Goal> goals = new ArrayList<>();

        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setObject(1, userId);
            if (accountId != null) {
                pstmt.setObject(2, accountId);
            } else {
                pstmt.setNull(2, Types.OTHER);
            }

            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                goals.add(mapGoal(rs));
            }
        } catch (SQLException e) {
            System.err.println("Fail to list goals for account: " + e.getMessage());
        }

        return goals;
    }

    public boolean update(Goal goal) {
        String sql = "UPDATE goals SET title = ?, description = ?, target_amount = ?, current_amount = ?, deadline = ?, account_id = ?, achieved = ?, updated_at = NOW() WHERE id = ?";

        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, goal.getTitle());

            if (goal.getDescription() != null) {
                pstmt.setString(2, goal.getDescription());
            } else {
                pstmt.setNull(2, Types.VARCHAR);
            }

            pstmt.setDouble(3, goal.getTargetAmount());
            pstmt.setDouble(4, goal.getCurrentAmount());

            if (goal.getDeadline() != null) {
                pstmt.setDate(5, Date.valueOf(goal.getDeadline()));
            } else {
                pstmt.setNull(5, Types.DATE);
            }

            if (goal.getAccountId() != null) {
                pstmt.setObject(6, goal.getAccountId());
            } else {
                pstmt.setNull(6, Types.OTHER);
            }

            pstmt.setBoolean(7, goal.isAchieved());
            pstmt.setObject(8, goal.getId());

            int rows = pstmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            System.err.println("Fail to update goal: " + e.getMessage());
            return false;
        }
    }

    public boolean updateProgress(UUID goalId, double currentAmount, boolean achieved) {
        String sql = "UPDATE goals SET current_amount = ?, achieved = ?, updated_at = NOW() WHERE id = ?";

        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setDouble(1, currentAmount);
            pstmt.setBoolean(2, achieved);
            pstmt.setObject(3, goalId);

            int rows = pstmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            System.err.println("Fail to update goal progress: " + e.getMessage());
            return false;
        }
    }

    public boolean delete(UUID id) {
        String sql = "DELETE FROM goals WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setObject(1, id);
            int rows = pstmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            System.err.println("Fail to delete goal: " + e.getMessage());
            return false;
        }
    }

    private Goal mapGoal(ResultSet rs) throws SQLException {
        OffsetDateTime createdAt = rs.getObject("created_at", OffsetDateTime.class);
        OffsetDateTime updatedAt = rs.getObject("updated_at", OffsetDateTime.class);

        return new Goal(
                (UUID) rs.getObject("id"),
                (UUID) rs.getObject("user_id"),
                (UUID) rs.getObject("account_id"),
                rs.getString("title"),
                rs.getString("description"),
                rs.getDouble("target_amount"),
                rs.getDouble("current_amount"),
                rs.getDate("deadline") != null ? rs.getDate("deadline").toLocalDate() : null,
                rs.getBoolean("achieved"),
                createdAt,
                updatedAt
        );
    }
}
