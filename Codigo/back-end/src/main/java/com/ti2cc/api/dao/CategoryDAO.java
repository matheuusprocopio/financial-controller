package com.ti2cc.api.dao;

import com.ti2cc.api.model.Category;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CategoryDAO {
    private Connection connection;

    public CategoryDAO(Connection connection) {
        this.connection = connection;
    }

    public boolean create(Category category) {
        StringBuilder sb = new StringBuilder();

        sb.append("INSERT INTO categories (");
        sb.append("name, user_id"); // user_id é obrigatório

        if (category.getImagePath() != null) {
            sb.append(", image_path");
        }

        if (category.getMainCategoryId() != null) {
            sb.append(", main_category_id");
        }

        sb.append(") VALUES (");
        sb.append("?, ?"); // parâmetros fixos: name e user_id

        if (category.getImagePath() != null) {
            sb.append(", ?");
        }

        if (category.getMainCategoryId() != null) {
            sb.append(", ?");
        }

        sb.append(")");

        String query = sb.toString();

        try (PreparedStatement pstmt = connection.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {
            int paramIndex = 1;

            // parâmetros fixos
            pstmt.setString(paramIndex++, category.getName());
            pstmt.setInt(paramIndex++, category.getUserId());

            // opcionais
            if (category.getImagePath() != null) {
                pstmt.setString(paramIndex++, category.getImagePath());
            }

            if (category.getMainCategoryId() != null) {
                pstmt.setInt(paramIndex++, category.getMainCategoryId());
            }

            int rowsAffected = pstmt.executeUpdate();

            if (rowsAffected > 0) {
                ResultSet generatedKeys = pstmt.getGeneratedKeys();
                if (generatedKeys.next()) {
                    category.setId(generatedKeys.getInt(1));
                }
            }

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
                pstmt.setInt(paramIndex++, category.getMainCategoryId());

            pstmt.setInt(paramIndex, category.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Fail to update category: " + e.getMessage());
            return false;
        }
    }

    public boolean delete(int id) {
        String query = "DELETE FROM categories WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, id);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Fail to delete category: " + e.getMessage());
            return false;
        }
    }

    public Category getById(int id) {
        String query = "SELECT * FROM categories WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return new Category(
                        rs.getInt("id"),
                        rs.getInt("user_id"),
                        rs.getString("name"),
                        rs.getString("image_path"),
                        rs.getInt("main_category_id"));
            }
        } catch (SQLException e) {
            System.err.println("Fail to get category by id: " + e.getMessage());
        }
        return null;
    }

    public List<Category> getAll() {
        List<Category> list = new ArrayList<>();
        String query = "SELECT * FROM categories";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Category c = new Category(
                        rs.getInt("id"),
                        rs.getInt("user_id"),
                        rs.getString("name"),
                        rs.getString("image_path"),
                        rs.getInt("main_category_id"));
                list.add(c);
            }
        } catch (SQLException e) {
            System.err.println("Fail to list categories: " + e.getMessage());
        }

        return list;
    }
}