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

import javax.sql.DataSource;

import com.ti2cc.api.model.Goal;
import com.ti2cc.api.util.VectorUtils;

public class GoalDAO {

    private final DataSource dataSource;

    public GoalDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public boolean create(Goal goal) {
        StringBuilder sb = new StringBuilder();
        sb.append("INSERT INTO goals (id, user_id, account_id, title, description, target_amount, current_amount, deadline, achieved");
        if (goal.getSearchEmbedding() != null) {
            sb.append(", search_embedding");
        }
        sb.append(") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?");
        if (goal.getSearchEmbedding() != null) {
            sb.append(", ?::vector");
        }
        sb.append(")");

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sb.toString())) {
            int paramIndex = 1;
            pstmt.setObject(paramIndex++, goal.getId());
            pstmt.setObject(paramIndex++, goal.getUserId());

            if (goal.getAccountId() != null) {
                pstmt.setObject(paramIndex++, goal.getAccountId());
            } else {
                pstmt.setNull(paramIndex++, Types.OTHER);
            }

            pstmt.setString(paramIndex++, goal.getTitle());

            if (goal.getDescription() != null) {
                pstmt.setString(paramIndex++, goal.getDescription());
            } else {
                pstmt.setNull(paramIndex++, Types.VARCHAR);
            }

            pstmt.setDouble(paramIndex++, goal.getTargetAmount());
            pstmt.setDouble(paramIndex++, goal.getCurrentAmount() != null ? goal.getCurrentAmount() : 0.0);

            if (goal.getDeadline() != null) {
                pstmt.setDate(paramIndex++, Date.valueOf(goal.getDeadline()));
            } else {
                pstmt.setNull(paramIndex++, Types.DATE);
            }

            pstmt.setBoolean(paramIndex++, goal.isAchieved());

            if (goal.getSearchEmbedding() != null) {
                pstmt.setString(paramIndex, VectorUtils.toPgVectorLiteral(goal.getSearchEmbedding()));
            }

            int rows = pstmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            System.err.println("Fail to insert goal: " + e.getMessage());
            return false;
        }
    }

    public Goal getById(UUID id) {
        String sql = "SELECT * FROM goals WHERE id = ?";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
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

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
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

    public List<Goal> listBySemantic(UUID userId, float[] embedding) {
        List<Goal> goals = new ArrayList<>();
        String vectorLiteral = VectorUtils.toPgVectorLiteral(embedding);
        if (vectorLiteral == null) {
            return goals;
        }

        String sql = "SELECT *, (search_embedding <=> ?::vector) AS distance FROM goals WHERE user_id = ? ORDER BY distance ASC NULLS LAST";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, vectorLiteral);
            pstmt.setObject(2, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                goals.add(mapGoal(rs));
            }
        } catch (SQLException e) {
            System.err.println("Fail to list goals by semantic search: " + e.getMessage());
        }

        return goals;
    }

    public List<Goal> listRelevantForAccount(UUID userId, UUID accountId) {
        String sql = "SELECT * FROM goals WHERE user_id = ? AND (account_id IS NULL OR account_id = ?)";
        List<Goal> goals = new ArrayList<>();

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
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
        StringBuilder sb = new StringBuilder("UPDATE goals SET title = ?, description = ?, target_amount = ?, current_amount = ?, deadline = ?, account_id = ?, achieved = ?, updated_at = NOW()");
        if (goal.getSearchEmbedding() != null) {
            sb.append(", search_embedding = ?::vector");
        }
        sb.append(" WHERE id = ?");

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sb.toString())) {
            int paramIndex = 1;
            pstmt.setString(paramIndex++, goal.getTitle());

            if (goal.getDescription() != null) {
                pstmt.setString(paramIndex++, goal.getDescription());
            } else {
                pstmt.setNull(paramIndex++, Types.VARCHAR);
            }

            pstmt.setDouble(paramIndex++, goal.getTargetAmount());
            pstmt.setDouble(paramIndex++, goal.getCurrentAmount());

            if (goal.getDeadline() != null) {
                pstmt.setDate(paramIndex++, Date.valueOf(goal.getDeadline()));
            } else {
                pstmt.setNull(paramIndex++, Types.DATE);
            }

            if (goal.getAccountId() != null) {
                pstmt.setObject(paramIndex++, goal.getAccountId());
            } else {
                pstmt.setNull(paramIndex++, Types.OTHER);
            }

            pstmt.setBoolean(paramIndex++, goal.isAchieved());

            if (goal.getSearchEmbedding() != null) {
                pstmt.setString(paramIndex++, VectorUtils.toPgVectorLiteral(goal.getSearchEmbedding()));
            }

            pstmt.setObject(paramIndex, goal.getId());

            int rows = pstmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            System.err.println("Fail to update goal: " + e.getMessage());
            return false;
        }
    }

    public boolean updateProgress(UUID goalId, double currentAmount, boolean achieved) {
        String sql = "UPDATE goals SET current_amount = ?, achieved = ?, updated_at = NOW() WHERE id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
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
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
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
                updatedAt,
                VectorUtils.parsePgVector(rs.getObject("search_embedding"))
        );
    }
}
