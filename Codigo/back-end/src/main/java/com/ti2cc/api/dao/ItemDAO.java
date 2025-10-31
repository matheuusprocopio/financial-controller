package com.ti2cc.api.dao;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.ti2cc.api.dto.DateRangeDTO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Item;
import com.ti2cc.api.model.Item.ItemType;

public class ItemDAO {
    private final Connection connection;

    public ItemDAO(Connection connection) {
        this.connection = connection;
    }

    public boolean create(Item item) {
        StringBuilder sb = new StringBuilder();

        sb.append("INSERT INTO items (");
        sb.append("id, category_id, user_id, account_id, name, description, amount, date, type");
        sb.append(") VALUES (");
        sb.append("?, ?, ?, ?, ?, ?, ?, ?, ?::item_type)");

        String query = sb.toString();

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            int paramIndex = 1;

            if (item.getId() == null) {
                item.setId(UUID.randomUUID());
            }

            pstmt.setObject(paramIndex++, item.getId());
            pstmt.setObject(paramIndex++, item.getCategoryId());
            pstmt.setObject(paramIndex++, item.getUserId());
            pstmt.setObject(paramIndex++, item.getAccountId());
            pstmt.setString(paramIndex++, item.getName());
            pstmt.setString(paramIndex++, item.getDescription());
            pstmt.setDouble(paramIndex++, item.getAmount());
            pstmt.setDate(paramIndex++, Date.valueOf(item.getDate()));
            pstmt.setString(paramIndex++, item.getType().name());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Fail to insert a new item: " + e.getMessage());
            return false;
        }
    }

    public boolean update(Item item) {
        StringBuilder query = new StringBuilder("UPDATE items SET ");
        boolean hasPrev = false;

        if (item.getCategoryId() != null) {
            query.append("category_id = ?");
            hasPrev = true;
        }

        if (item.getUserId() != null) {
            if (hasPrev) query.append(", ");
            query.append("user_id = ?");
            hasPrev = true;
        }

        if (item.getAccountId() != null) {
            if (hasPrev) query.append(", ");
            query.append("account_id = ?");
            hasPrev = true;
        }

        if (item.getName() != null) {
            if (hasPrev) query.append(", ");
            query.append("name = ?");
            hasPrev = true;
        }

        if (item.getDescription() != null) {
            if (hasPrev) query.append(", ");
            query.append("description = ?");
            hasPrev = true;
        }

        if (item.getAmount() != null) {
            if (hasPrev) query.append(", ");
            query.append("amount = ?");
            hasPrev = true;
        }

        if (item.getDate() != null) {
            if (hasPrev) query.append(", ");
            query.append("date = ?");
            hasPrev = true;
        }

        if (item.getType() != null) {
            if (hasPrev) query.append(", ");
            query.append("type = ?::item_type");
        }

        query.append(" WHERE id = ?");

        try (PreparedStatement pstmt = connection.prepareStatement(query.toString())) {
            int paramIndex = 1;

            if (item.getCategoryId() != null)
                pstmt.setObject(paramIndex++, item.getCategoryId());

            if (item.getUserId() != null)
                pstmt.setObject(paramIndex++, item.getUserId());

            if (item.getAccountId() != null)
                pstmt.setObject(paramIndex++, item.getAccountId());

            if (item.getName() != null)
                pstmt.setString(paramIndex++, item.getName());

            if (item.getDescription() != null)
                pstmt.setString(paramIndex++, item.getDescription());

            if (item.getAmount() != null)
                pstmt.setDouble(paramIndex++, item.getAmount());

            if (item.getDate() != null)
                pstmt.setDate(paramIndex++, Date.valueOf(item.getDate()));

            if (item.getType() != null)
                pstmt.setString(paramIndex++, item.getType().name());

            pstmt.setObject(paramIndex, item.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Fail to update item: " + e.getMessage());
            return false;
        }
    }

    public boolean delete(UUID id) {
        String query = "DELETE FROM items WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, id);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Fail to delete item: " + e.getMessage());
            return false;
        }
    }

    public Item getById(UUID id) {
        String query = "SELECT * FROM items WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Item(
                        (UUID) rs.getObject("id"),
                        (UUID) rs.getObject("category_id"),
                        (UUID) rs.getObject("user_id"),
                        (UUID) rs.getObject("account_id"),
                        rs.getString("name"),
                        rs.getString("description"),
                        rs.getDouble("amount"),
                        rs.getDate("date").toLocalDate(),
                        ItemType.valueOf(rs.getString("type"))
                );
            }
        } catch (SQLException e) {
            System.err.println("Fail to get item by id: " + e.getMessage());
        }
        return null;
    }

    public PaginatedResponseDTO<Item> getByUserId(UUID userId, String nameFilter, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        List<Item> list = new ArrayList<>();
        long totalItems = 0;
        boolean hasNameFilter = nameFilter != null && !nameFilter.isBlank();

        StringBuilder countQuery = new StringBuilder("SELECT COUNT(*) FROM items WHERE user_id = ? AND date BETWEEN ? AND ?");
        if (hasNameFilter) {
            countQuery.append(" AND LOWER(name) LIKE LOWER(?)");
        }

        StringBuilder dataQuery = new StringBuilder("SELECT * FROM items WHERE user_id = ? AND date BETWEEN ? AND ?");
        if (hasNameFilter) {
            dataQuery.append(" AND LOWER(name) LIKE LOWER(?)");
        }
        dataQuery.append(" ORDER BY date DESC LIMIT ? OFFSET ?");

        try (PreparedStatement countStmt = connection.prepareStatement(countQuery.toString())) {
            int index = 1;
            countStmt.setObject(index++, userId);
            countStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            countStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasNameFilter) {
                countStmt.setString(index, "%" + nameFilter + "%");
            }

            ResultSet rs = countStmt.executeQuery();
            if (rs.next()) {
                totalItems = rs.getLong(1);
            }
        } catch (SQLException e) {
            System.err.println("Fail to count items by user: " + e.getMessage());
        }

        try (PreparedStatement dataStmt = connection.prepareStatement(dataQuery.toString())) {
            int index = 1;
            dataStmt.setObject(index++, userId);
            dataStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            dataStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasNameFilter) {
                dataStmt.setString(index++, "%" + nameFilter + "%");
            }

            dataStmt.setInt(index++, pagination.getPageLimit());
            dataStmt.setInt(index, pagination.getOffset());

            ResultSet rs = dataStmt.executeQuery();

            while (rs.next()) {
                Item item = new Item(
                        (UUID) rs.getObject("id"),
                        (UUID) rs.getObject("category_id"),
                        (UUID) rs.getObject("user_id"),
                        (UUID) rs.getObject("account_id"),
                        rs.getString("name"),
                        rs.getString("description"),
                        rs.getDouble("amount"),
                        rs.getDate("date").toLocalDate(),
                        ItemType.valueOf(rs.getString("type"))
                );
                list.add(item);
            }
        } catch (SQLException e) {
            System.err.println("Fail to list items by user: " + e.getMessage());
        }

        return new PaginatedResponseDTO<>(list, totalItems, pagination.getPage(), pagination.getPageLimit());
    }

    public PaginatedResponseDTO<Item> getByCategoryId(UUID categoryId, UUID userId, String nameFilter, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        List<Item> list = new ArrayList<>();
        long totalItems = 0;
        boolean hasNameFilter = nameFilter != null && !nameFilter.isBlank();

        StringBuilder countQuery = new StringBuilder("SELECT COUNT(*) FROM items WHERE category_id = ? AND user_id = ? AND date BETWEEN ? AND ?");
        if (hasNameFilter) {
            countQuery.append(" AND LOWER(name) LIKE LOWER(?)");
        }

        StringBuilder dataQuery = new StringBuilder("SELECT * FROM items WHERE category_id = ? AND user_id = ? AND date BETWEEN ? AND ?");
        if (hasNameFilter) {
            dataQuery.append(" AND LOWER(name) LIKE LOWER(?)");
        }
        dataQuery.append(" ORDER BY date DESC LIMIT ? OFFSET ?");

        try (PreparedStatement countStmt = connection.prepareStatement(countQuery.toString())) {
            int index = 1;
            countStmt.setObject(index++, categoryId);
            countStmt.setObject(index++, userId);
            countStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            countStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasNameFilter) {
                countStmt.setString(index, "%" + nameFilter + "%");
            }

            ResultSet rs = countStmt.executeQuery();
            if (rs.next()) {
                totalItems = rs.getLong(1);
            }
        } catch (SQLException e) {
            System.err.println("Fail to count items by category: " + e.getMessage());
        }

        try (PreparedStatement dataStmt = connection.prepareStatement(dataQuery.toString())) {
            int index = 1;
            dataStmt.setObject(index++, categoryId);
            dataStmt.setObject(index++, userId);
            dataStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            dataStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasNameFilter) {
                dataStmt.setString(index++, "%" + nameFilter + "%");
            }

            dataStmt.setInt(index++, pagination.getPageLimit());
            dataStmt.setInt(index, pagination.getOffset());

            ResultSet rs = dataStmt.executeQuery();

            while (rs.next()) {
                Item item = new Item(
                        (UUID) rs.getObject("id"),
                        (UUID) rs.getObject("category_id"),
                        (UUID) rs.getObject("user_id"),
                        (UUID) rs.getObject("account_id"),
                        rs.getString("name"),
                        rs.getString("description"),
                        rs.getDouble("amount"),
                        rs.getDate("date").toLocalDate(),
                        ItemType.valueOf(rs.getString("type"))
                );
                list.add(item);
            }
        } catch (SQLException e) {
            System.err.println("Fail to list items by category: " + e.getMessage());
        }

        return new PaginatedResponseDTO<>(list, totalItems, pagination.getPage(), pagination.getPageLimit());
    }
}
