package com.ti2cc.api.dao;

import com.ti2cc.api.model.Category;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CategoryDAO {
    private Connection connection;

    public CategoryDAO(Connection connection) {
        this.connection = connection;
    }

    public boolean create(Category category) {
        StringBuilder sb = new StringBuilder();

        sb.append("INSERT INTO categories (");
        sb.append("id, name, user_id"); // user_id é obrigatório

        if (category.getImagePath() != null) {
            sb.append(", image_path");
        }

        if (category.getMainCategoryId() != null) {
            sb.append(", main_category_id");
        }

        sb.append(") VALUES (");
        sb.append("?, ?, ?"); // parâmetros fixos: id, name e user_id

        if (category.getImagePath() != null) {
            sb.append(", ?");
        }

        if (category.getMainCategoryId() != null) {
            sb.append(", ?");
        }

        sb.append(")");

        String query = sb.toString();

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            int paramIndex = 1;

            if (category.getId() == null) {
                category.setId(UUID.randomUUID());
            }

            // parâmetros fixos
            pstmt.setObject(paramIndex++, category.getId());
            pstmt.setString(paramIndex++, category.getName());
            pstmt.setObject(paramIndex++, category.getUserId());

            // opcionais
            if (category.getImagePath() != null) {
                pstmt.setString(paramIndex++, category.getImagePath());
            }

            if (category.getMainCategoryId() != null) {
                pstmt.setObject(paramIndex++, category.getMainCategoryId());
            }

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Fail to insert a new category: " + e.getMessage());
            return false;
        }
    }

    public boolean update(Category category) {
        StringBuilder query = new StringBuilder("UPDATE categories SET ");
        boolean hasPrev = false;

        if (category.getName() != null) {
            query.append("name = ?");
            hasPrev = true;
        }

        if (category.getImagePath() != null) {
            if (hasPrev)
                query.append(", ");
            query.append("image_path = ?");
            hasPrev = true;
        }

        if (category.getMainCategoryId() != null) {
            if (hasPrev)
                query.append(", ");
            query.append("main_category_id = ?");
        }

        query.append(" WHERE id = ?");

        try (PreparedStatement pstmt = connection.prepareStatement(query.toString())) {
            int paramIndex = 1;

            if (category.getName() != null)
                pstmt.setString(paramIndex++, category.getName());

            if (category.getImagePath() != null)
                pstmt.setString(paramIndex++, category.getImagePath());

            if (category.getMainCategoryId() != null)
                pstmt.setObject(paramIndex++, category.getMainCategoryId());

            pstmt.setObject(paramIndex, category.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Fail to update category: " + e.getMessage());
            return false;
        }
    }

    public boolean delete(UUID id) {
        String query = "DELETE FROM categories WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, id);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Fail to delete category: " + e.getMessage());
            return false;
        }
    }

    public Category getById(UUID id) {
        String query = "SELECT * FROM categories WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Category(
                        (UUID) rs.getObject("id"),
                        (UUID) rs.getObject("user_id"),
                        rs.getString("name"),
                        rs.getString("image_path"),
                        (UUID) rs.getObject("main_category_id"));
            }
        } catch (SQLException e) {
            System.err.println("Fail to get category by id: " + e.getMessage());
        }
        return null;
    }

    public List<Category> getByFilters(UUID userId, String name, UUID mainCategoryId) {
        List<Category> list = new ArrayList<>();
        StringBuilder query = new StringBuilder("SELECT * FROM categories WHERE user_id = ?");

        boolean hasNameFilter = name != null && !name.trim().isEmpty();

        if (hasNameFilter) {
            query.append(" AND name ILIKE ?");
        }

        if (mainCategoryId != null) {
            query.append(" AND main_category_id = ?");
        }

        try (PreparedStatement pstmt = connection.prepareStatement(query.toString())) {
            int paramIndex = 1;
            pstmt.setObject(paramIndex++, userId);

            if (hasNameFilter) {
                pstmt.setString(paramIndex++, "%" + name.trim() + "%");
            }

            if (mainCategoryId != null) {
                pstmt.setObject(paramIndex, mainCategoryId);
            }

            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Category c = new Category(
                        (UUID) rs.getObject("id"),
                        (UUID) rs.getObject("user_id"),
                        rs.getString("name"),
                        rs.getString("image_path"),
                        (UUID) rs.getObject("main_category_id"));
                list.add(c);
            }
        } catch (SQLException e) {
            System.err.println("Fail to list categories by filters: " + e.getMessage());
        }

        return list;
    }
}
