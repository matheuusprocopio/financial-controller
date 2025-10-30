package com.ti2cc.api.dao;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
        sb.append("id, category_id, owner_id, account_id, name, amount, date, type");

        if (item.getDescription() != null) {
            sb.append(", description");
        }

        sb.append(") VALUES (");
        sb.append("?, ?, ?, ?, ?, ?, ?, ?::item_type");

        if (item.getDescription() != null) {
            sb.append(", ?");
        }

        sb.append(")");

        String query = sb.toString();

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            int paramIndex = 1;

            // Generate UUID if not provided
            if (item.getId() == null) {
                item.setId(UUID.randomUUID());
            }

            pstmt.setObject(paramIndex++, item.getId());
            pstmt.setObject(paramIndex++, item.getCategoryId());
            pstmt.setObject(paramIndex++, item.getOwnerId());
            pstmt.setObject(paramIndex++, item.getAccountId());
            pstmt.setString(paramIndex++, item.getName());
            pstmt.setDouble(paramIndex++, item.getAmount());
            pstmt.setDate(paramIndex++, Date.valueOf(item.getDate()));
            pstmt.setString(paramIndex++, item.getType().name());

            if (item.getDescription() != null) {
                pstmt.setString(paramIndex++, item.getDescription());
            }

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
                        (UUID) rs.getObject("owner_id"),
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

    public List<Item> getAll() {
        List<Item> list = new ArrayList<>();
        String query = "SELECT * FROM items ORDER BY date DESC";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Item item = new Item(
                        (UUID) rs.getObject("id"),
                        (UUID) rs.getObject("category_id"),
                        (UUID) rs.getObject("owner_id"),
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
            System.err.println("Fail to list items: " + e.getMessage());
        }

        return list;
    }

    public List<Item> getByOwnerId(UUID ownerId) {
        List<Item> list = new ArrayList<>();
        String query = "SELECT * FROM items WHERE owner_id = ? ORDER BY date DESC";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, ownerId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                Item item = new Item(
                        (UUID) rs.getObject("id"),
                        (UUID) rs.getObject("category_id"),
                        (UUID) rs.getObject("owner_id"),
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
            System.err.println("Fail to list items by owner: " + e.getMessage());
        }

        return list;
    }

    public List<Item> getByCategoryId(UUID categoryId) {
        List<Item> list = new ArrayList<>();
        String query = "SELECT * FROM items WHERE category_id = ? ORDER BY date DESC";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, categoryId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                Item item = new Item(
                        (UUID) rs.getObject("id"),
                        (UUID) rs.getObject("category_id"),
                        (UUID) rs.getObject("owner_id"),
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

        return list;
    }
}
