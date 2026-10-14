package com.ti2cc.api.dao;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import javax.sql.DataSource;

import com.ti2cc.api.dto.DateRangeDTO;
import com.ti2cc.api.dto.ItemAnalyticsPointDTO;
import com.ti2cc.api.dto.ItemAnalyticsRequestDTO;
import com.ti2cc.api.dto.ItemAnalyticsRequestDTO.GroupBy;
import com.ti2cc.api.dto.ItemAnalyticsRequestDTO.Metric;
import com.ti2cc.api.dto.ItemAnalyticsResponseDTO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Item;
import com.ti2cc.api.model.Item.ItemType;
import com.ti2cc.api.util.VectorUtils;

public class ItemDAO {
    private final DataSource dataSource;

    public ItemDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public boolean create(Item item) {
        StringBuilder sb = new StringBuilder();

        sb.append("INSERT INTO items (");
        sb.append("id, category_id, user_id, account_id, name, description, amount, date, type");
        if (item.getSearchEmbedding() != null) {
            sb.append(", search_embedding");
        }
        sb.append(") VALUES (");
        sb.append("?, ?, ?, ?, ?, ?, ?, ?, ?::item_type");
        if (item.getSearchEmbedding() != null) {
            sb.append(", ?::vector");
        }
        sb.append(")");

        String query = sb.toString();

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(query)) {
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
            if (item.getSearchEmbedding() != null) {
                pstmt.setString(paramIndex++, VectorUtils.toPgVectorLiteral(item.getSearchEmbedding()));
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
            hasPrev = true;
        }

        if (item.getSearchEmbedding() != null) {
            if (hasPrev) query.append(", ");
            query.append("search_embedding = ?::vector");
        }

        query.append(" WHERE id = ?");

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(query.toString())) {
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

            if (item.getSearchEmbedding() != null)
                pstmt.setString(paramIndex++, VectorUtils.toPgVectorLiteral(item.getSearchEmbedding()));

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
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(query)) {
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
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapItem(rs);
            }
        } catch (SQLException e) {
            System.err.println("Fail to get item by id: " + e.getMessage());
        }
        return null;
    }

    public PaginatedResponseDTO<Item> getByUserId(UUID userId, String nameFilter, String typeFilter, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        List<Item> list = new ArrayList<>();
        long totalItems = 0;
        boolean hasNameFilter = nameFilter != null && !nameFilter.isBlank();
        boolean hasTypeFilter = typeFilter != null && !typeFilter.isBlank();

        StringBuilder countQuery = new StringBuilder("SELECT COUNT(*) FROM items WHERE user_id = ? AND date BETWEEN ? AND ?");
        if (hasNameFilter) {
            countQuery.append(" AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))");
        }
        if (hasTypeFilter) {
            countQuery.append(" AND type = ?::item_type");
        }

        StringBuilder dataQuery = new StringBuilder("SELECT * FROM items WHERE user_id = ? AND date BETWEEN ? AND ?");
        if (hasNameFilter) {
            dataQuery.append(" AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))");
        }
        if (hasTypeFilter) {
            dataQuery.append(" AND type = ?::item_type");
        }
        dataQuery.append(" ORDER BY date DESC LIMIT ? OFFSET ?");

        try (Connection connection = dataSource.getConnection();
             PreparedStatement countStmt = connection.prepareStatement(countQuery.toString())) {
            int index = 1;
            countStmt.setObject(index++, userId);
            countStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            countStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasNameFilter) {
                countStmt.setString(index++, "%" + nameFilter + "%");
                countStmt.setString(index++, "%" + nameFilter + "%");
            }

            if (hasTypeFilter) {
                countStmt.setString(index++, typeFilter);
            }

            ResultSet rs = countStmt.executeQuery();
            if (rs.next()) {
                totalItems = rs.getLong(1);
            }
        } catch (SQLException e) {
            System.err.println("Fail to count items by user: " + e.getMessage());
        }

        try (Connection connection = dataSource.getConnection();
             PreparedStatement dataStmt = connection.prepareStatement(dataQuery.toString())) {
            int index = 1;
            dataStmt.setObject(index++, userId);
            dataStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            dataStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasNameFilter) {
                dataStmt.setString(index++, "%" + nameFilter + "%");
                dataStmt.setString(index++, "%" + nameFilter + "%");
            }

            if (hasTypeFilter) {
                dataStmt.setString(index++, typeFilter);
            }

            dataStmt.setInt(index++, pagination.getPageLimit());
            dataStmt.setInt(index, pagination.getOffset());

            ResultSet rs = dataStmt.executeQuery();

            while (rs.next()) {
                list.add(mapItem(rs));
            }
        } catch (SQLException e) {
            System.err.println("Fail to list items by user: " + e.getMessage());
        }

        return new PaginatedResponseDTO<>(list, totalItems, pagination.getPage(), pagination.getPageLimit());
    }

    public PaginatedResponseDTO<Item> getByUserIdSemantic(UUID userId, float[] embedding, String typeFilter, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        List<Item> list = new ArrayList<>();
        long totalItems = 0;
        boolean hasTypeFilter = typeFilter != null && !typeFilter.isBlank();
        String vectorLiteral = VectorUtils.toPgVectorLiteral(embedding);
        if (vectorLiteral == null) {
            return new PaginatedResponseDTO<>(list, totalItems, pagination.getPage(), pagination.getPageLimit());
        }

        StringBuilder countQuery = new StringBuilder("SELECT COUNT(*) FROM items WHERE user_id = ? AND search_embedding IS NOT NULL AND date BETWEEN ? AND ?");
        if (hasTypeFilter) {
            countQuery.append(" AND type = ?::item_type");
        }

        StringBuilder dataQuery = new StringBuilder("SELECT *, (search_embedding <=> ?::vector) AS distance FROM items WHERE user_id = ? AND search_embedding IS NOT NULL AND date BETWEEN ? AND ?");
        if (hasTypeFilter) {
            dataQuery.append(" AND type = ?::item_type");
        }
        dataQuery.append(" ORDER BY distance ASC LIMIT ? OFFSET ?");

        try (Connection connection = dataSource.getConnection();
             PreparedStatement countStmt = connection.prepareStatement(countQuery.toString())) {
            int index = 1;
            countStmt.setObject(index++, userId);
            countStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            countStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasTypeFilter) {
                countStmt.setString(index++, typeFilter);
            }

            ResultSet rs = countStmt.executeQuery();
            if (rs.next()) {
                totalItems = rs.getLong(1);
            }
        } catch (SQLException e) {
            System.err.println("Fail to count items by semantic search: " + e.getMessage());
        }

        try (Connection connection = dataSource.getConnection();
             PreparedStatement dataStmt = connection.prepareStatement(dataQuery.toString())) {
            int index = 1;
            dataStmt.setString(index++, vectorLiteral);
            dataStmt.setObject(index++, userId);
            dataStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            dataStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasTypeFilter) {
                dataStmt.setString(index++, typeFilter);
            }

            dataStmt.setInt(index++, pagination.getPageLimit());
            dataStmt.setInt(index, pagination.getOffset());

            ResultSet rs = dataStmt.executeQuery();

            while (rs.next()) {
                list.add(mapItem(rs));
            }
        } catch (SQLException e) {
            System.err.println("Fail to list items by semantic search: " + e.getMessage());
        }

        return new PaginatedResponseDTO<>(list, totalItems, pagination.getPage(), pagination.getPageLimit());
    }

    public PaginatedResponseDTO<Item> getByCategoryId(UUID categoryId, UUID userId, String nameFilter, String typeFilter, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        List<Item> list = new ArrayList<>();
        long totalItems = 0;
        boolean hasNameFilter = nameFilter != null && !nameFilter.isBlank();
        boolean hasTypeFilter = typeFilter != null && !typeFilter.isBlank();

        StringBuilder countQuery = new StringBuilder("SELECT COUNT(*) FROM items WHERE category_id = ? AND user_id = ? AND date BETWEEN ? AND ?");
        if (hasNameFilter) {
            countQuery.append(" AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))");
        }
        if (hasTypeFilter) {
            countQuery.append(" AND type = ?::item_type");
        }

        StringBuilder dataQuery = new StringBuilder("SELECT * FROM items WHERE category_id = ? AND user_id = ? AND date BETWEEN ? AND ?");
        if (hasNameFilter) {
            dataQuery.append(" AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))");
        }
        if (hasTypeFilter) {
            dataQuery.append(" AND type = ?::item_type");
        }
        dataQuery.append(" ORDER BY date DESC LIMIT ? OFFSET ?");

        try (Connection connection = dataSource.getConnection();
             PreparedStatement countStmt = connection.prepareStatement(countQuery.toString())) {
            int index = 1;
            countStmt.setObject(index++, categoryId);
            countStmt.setObject(index++, userId);
            countStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            countStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasNameFilter) {
                countStmt.setString(index++, "%" + nameFilter + "%");
                countStmt.setString(index++, "%" + nameFilter + "%");
            }

            if (hasTypeFilter) {
                countStmt.setString(index++, typeFilter);
            }

            ResultSet rs = countStmt.executeQuery();
            if (rs.next()) {
                totalItems = rs.getLong(1);
            }
        } catch (SQLException e) {
            System.err.println("Fail to count items by category: " + e.getMessage());
        }

        try (Connection connection = dataSource.getConnection();
             PreparedStatement dataStmt = connection.prepareStatement(dataQuery.toString())) {
            int index = 1;
            dataStmt.setObject(index++, categoryId);
            dataStmt.setObject(index++, userId);
            dataStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            dataStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasNameFilter) {
                dataStmt.setString(index++, "%" + nameFilter + "%");
                dataStmt.setString(index++, "%" + nameFilter + "%");
            }

            if (hasTypeFilter) {
                dataStmt.setString(index++, typeFilter);
            }

            dataStmt.setInt(index++, pagination.getPageLimit());
            dataStmt.setInt(index, pagination.getOffset());

            ResultSet rs = dataStmt.executeQuery();

            while (rs.next()) {
                list.add(mapItem(rs));
            }
        } catch (SQLException e) {
            System.err.println("Fail to list items by category: " + e.getMessage());
        }

        return new PaginatedResponseDTO<>(list, totalItems, pagination.getPage(), pagination.getPageLimit());
    }

    public ItemAnalyticsResponseDTO getAnalytics(ItemAnalyticsRequestDTO req) {
        List<ItemAnalyticsPointDTO> result = new ArrayList<>();
        List<String> selectParts = new ArrayList<>();
        List<String> groupParts = new ArrayList<>();
        
        List<GroupBy> groupByList = req.getGroupBy() != null ? req.getGroupBy() : Collections.emptyList();
        
        boolean joinCategory = req.getCategoryId() != null;
        boolean joinAccount = req.getAccountId() != null;

        for (GroupBy gb : groupByList) {
            switch (gb) {
                case month -> {
                    selectParts.add("to_char(i.date, 'YYYY-MM') AS month");
                    groupParts.add("to_char(i.date, 'YYYY-MM')");
                }
                case category -> {
                    selectParts.add("c.name AS category_name");
                    groupParts.add("c.name");
                    joinCategory = true;
                }
                case account -> {
                    selectParts.add("a.name AS account_name");
                    groupParts.add("a.name");
                    joinAccount = true;
                }
                case type -> {
                    selectParts.add("i.type AS item_type");
                    groupParts.add("i.type");
                }
            }
        }

        Metric metric = req.getMetric() != null ? req.getMetric() : Metric.total_expenses;
        String metricExpr = switch (metric) {
            case total_incomes -> "SUM(CASE WHEN i.type = 'income' THEN i.amount ELSE 0 END)";
            case balance -> "SUM(CASE WHEN i.type = 'income' THEN i.amount ELSE 0 END) - SUM(CASE WHEN i.type = 'expense' THEN i.amount ELSE 0 END)";
            case count_items -> "COUNT(*)";
            default -> "SUM(CASE WHEN i.type = 'expense' THEN i.amount ELSE 0 END)";
        };

        StringBuilder sql = new StringBuilder();
        sql.append("SELECT ");
        if (!selectParts.isEmpty()) {
            sql.append(String.join(", ", selectParts)).append(", ");
        }
        sql.append(metricExpr).append(" AS value ");
        sql.append("FROM items i ");
        
        if (joinCategory) {
            sql.append("LEFT JOIN categories c ON c.id = i.category_id ");
        }
        if (joinAccount) {
            sql.append("LEFT JOIN accounts a ON a.id = i.account_id ");
        }

        sql.append("WHERE i.user_id = ? ");
        sql.append("AND i.date BETWEEN ? AND ? ");

        if (req.getCategoryId() != null) {
            sql.append("AND i.category_id = ? ");
        }
        if (req.getAccountId() != null) {
            sql.append("AND i.account_id = ? ");
        }

        if (!groupParts.isEmpty()) {
            String joinedGroups = String.join(", ", groupParts);
            sql.append("GROUP BY ").append(joinedGroups).append(" ");
            sql.append("ORDER BY ").append(joinedGroups).append(" ");
        }

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql.toString())) {
            int idx = 1;
            pstmt.setObject(idx++, req.getUserId());
            pstmt.setDate(idx++, Date.valueOf(req.getStartDate()));
            pstmt.setDate(idx++, Date.valueOf(req.getEndDate()));

            if (req.getCategoryId() != null) {
                pstmt.setObject(idx++, req.getCategoryId());
            }
            if (req.getAccountId() != null) {
                pstmt.setObject(idx++, req.getAccountId());
            }

            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    ItemAnalyticsPointDTO point = new ItemAnalyticsPointDTO();
                    point.setValue(rs.getDouble("value"));

                    for (GroupBy gb : groupByList) {
                        switch (gb) {
                            case month -> point.setMonth(rs.getString("month"));
                            case category -> point.setCategoryName(rs.getString("category_name"));
                            case account -> point.setAccountName(rs.getString("account_name"));
                            case type -> point.setType(rs.getString("item_type"));
                        }
                    }
                    result.add(point);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to run analytics query", e);
        }

        ItemAnalyticsResponseDTO resp = new ItemAnalyticsResponseDTO();
        resp.setMetric(metric.name());
        resp.setGroupBy(groupByList.stream().map(Enum::name).toArray(String[]::new));
        resp.setPoints(result);

        return resp;
    }

    public PaginatedResponseDTO<Item> getByCategoryAndAccount(UUID categoryId, UUID accountId, UUID userId, String nameFilter, String typeFilter, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        List<Item> list = new ArrayList<>();
        long totalItems = 0;
        boolean hasNameFilter = nameFilter != null && !nameFilter.isBlank();
        boolean hasTypeFilter = typeFilter != null && !typeFilter.isBlank();

        StringBuilder countQuery = new StringBuilder(
                "SELECT COUNT(*) FROM items WHERE category_id = ? AND account_id = ? AND user_id = ? AND date BETWEEN ? AND ?");
        if (hasNameFilter) {
            countQuery.append(" AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))");
        }
        if (hasTypeFilter) {
            countQuery.append(" AND type = ?::item_type");
        }

        StringBuilder dataQuery = new StringBuilder(
                "SELECT * FROM items WHERE category_id = ? AND account_id = ? AND user_id = ? AND date BETWEEN ? AND ?");
        if (hasNameFilter) {
            dataQuery.append(" AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))");
        }
        if (hasTypeFilter) {
            dataQuery.append(" AND type = ?::item_type");
        }
        dataQuery.append(" ORDER BY date DESC LIMIT ? OFFSET ?");

        try (Connection connection = dataSource.getConnection();
             PreparedStatement countStmt = connection.prepareStatement(countQuery.toString())) {
            int index = 1;
            countStmt.setObject(index++, categoryId);
            countStmt.setObject(index++, accountId);
            countStmt.setObject(index++, userId);
            countStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            countStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasNameFilter) {
                countStmt.setString(index++, "%" + nameFilter + "%");
                countStmt.setString(index++, "%" + nameFilter + "%");
            }

            if (hasTypeFilter) {
                countStmt.setString(index++, typeFilter);
            }

            ResultSet rs = countStmt.executeQuery();
            if (rs.next()) {
                totalItems = rs.getLong(1);
            }
        } catch (SQLException e) {
            System.err.println("Fail to count items by category and account: " + e.getMessage());
        }

        try (Connection connection = dataSource.getConnection();
             PreparedStatement dataStmt = connection.prepareStatement(dataQuery.toString())) {
            int index = 1;
            dataStmt.setObject(index++, categoryId);
            dataStmt.setObject(index++, accountId);
            dataStmt.setObject(index++, userId);
            dataStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            dataStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasNameFilter) {
                dataStmt.setString(index++, "%" + nameFilter + "%");
                dataStmt.setString(index++, "%" + nameFilter + "%");
            }

            if (hasTypeFilter) {
                dataStmt.setString(index++, typeFilter);
            }

            dataStmt.setInt(index++, pagination.getPageLimit());
            dataStmt.setInt(index, pagination.getOffset());

            ResultSet rs = dataStmt.executeQuery();

            while (rs.next()) {
                list.add(mapItem(rs));
            }
        } catch (SQLException e) {
            System.err.println("Fail to list items by category and account: " + e.getMessage());
        }

        return new PaginatedResponseDTO<>(list, totalItems, pagination.getPage(), pagination.getPageLimit());
    }

    public PaginatedResponseDTO<Item> getByCategoryIdSemantic(UUID categoryId, UUID userId, float[] embedding, String typeFilter, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        List<Item> list = new ArrayList<>();
        long totalItems = 0;
        boolean hasTypeFilter = typeFilter != null && !typeFilter.isBlank();
        String vectorLiteral = VectorUtils.toPgVectorLiteral(embedding);
        if (vectorLiteral == null) {
            return new PaginatedResponseDTO<>(list, totalItems, pagination.getPage(), pagination.getPageLimit());
        }

        StringBuilder countQuery = new StringBuilder("SELECT COUNT(*) FROM items WHERE category_id = ? AND user_id = ? AND search_embedding IS NOT NULL AND date BETWEEN ? AND ?");
        if (hasTypeFilter) {
            countQuery.append(" AND type = ?::item_type");
        }

        StringBuilder dataQuery = new StringBuilder("SELECT *, (search_embedding <=> ?::vector) AS distance FROM items WHERE category_id = ? AND user_id = ? AND search_embedding IS NOT NULL AND date BETWEEN ? AND ?");
        if (hasTypeFilter) {
            dataQuery.append(" AND type = ?::item_type");
        }
        dataQuery.append(" ORDER BY distance ASC LIMIT ? OFFSET ?");

        try (Connection connection = dataSource.getConnection();
             PreparedStatement countStmt = connection.prepareStatement(countQuery.toString())) {
            int index = 1;
            countStmt.setObject(index++, categoryId);
            countStmt.setObject(index++, userId);
            countStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            countStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasTypeFilter) {
                countStmt.setString(index++, typeFilter);
            }

            ResultSet rs = countStmt.executeQuery();
            if (rs.next()) {
                totalItems = rs.getLong(1);
            }
        } catch (SQLException e) {
            System.err.println("Fail to count items by semantic search within category: " + e.getMessage());
        }

        try (Connection connection = dataSource.getConnection();
             PreparedStatement dataStmt = connection.prepareStatement(dataQuery.toString())) {
            int index = 1;
            dataStmt.setString(index++, vectorLiteral);
            dataStmt.setObject(index++, categoryId);
            dataStmt.setObject(index++, userId);
            dataStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            dataStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasTypeFilter) {
                dataStmt.setString(index++, typeFilter);
            }

            dataStmt.setInt(index++, pagination.getPageLimit());
            dataStmt.setInt(index, pagination.getOffset());

            ResultSet rs = dataStmt.executeQuery();

            while (rs.next()) {
                list.add(mapItem(rs));
            }
        } catch (SQLException e) {
            System.err.println("Fail to list items by semantic search within category: " + e.getMessage());
        }

        return new PaginatedResponseDTO<>(list, totalItems, pagination.getPage(), pagination.getPageLimit());
    }

    public PaginatedResponseDTO<Item> getByCategoryAndAccountSemantic(UUID categoryId, UUID accountId, UUID userId, float[] embedding, String typeFilter, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        List<Item> list = new ArrayList<>();
        long totalItems = 0;
        boolean hasTypeFilter = typeFilter != null && !typeFilter.isBlank();
        String vectorLiteral = VectorUtils.toPgVectorLiteral(embedding);
        if (vectorLiteral == null) {
            return new PaginatedResponseDTO<>(list, totalItems, pagination.getPage(), pagination.getPageLimit());
        }

        StringBuilder countQuery = new StringBuilder(
                "SELECT COUNT(*) FROM items WHERE category_id = ? AND account_id = ? AND user_id = ? AND search_embedding IS NOT NULL AND date BETWEEN ? AND ?");
        if (hasTypeFilter) {
            countQuery.append(" AND type = ?::item_type");
        }

        StringBuilder dataQuery = new StringBuilder(
                "SELECT *, (search_embedding <=> ?::vector) AS distance FROM items WHERE category_id = ? AND account_id = ? AND user_id = ? AND search_embedding IS NOT NULL AND date BETWEEN ? AND ?");
        if (hasTypeFilter) {
            dataQuery.append(" AND type = ?::item_type");
        }
        dataQuery.append(" ORDER BY distance ASC LIMIT ? OFFSET ?");

        try (Connection connection = dataSource.getConnection();
             PreparedStatement countStmt = connection.prepareStatement(countQuery.toString())) {
            int index = 1;
            countStmt.setObject(index++, categoryId);
            countStmt.setObject(index++, accountId);
            countStmt.setObject(index++, userId);
            countStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            countStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasTypeFilter) {
                countStmt.setString(index++, typeFilter);
            }

            ResultSet rs = countStmt.executeQuery();
            if (rs.next()) {
                totalItems = rs.getLong(1);
            }
        } catch (SQLException e) {
            System.err.println("Fail to count items by semantic search within category and account: " + e.getMessage());
        }

        try (Connection connection = dataSource.getConnection();
             PreparedStatement dataStmt = connection.prepareStatement(dataQuery.toString())) {
            int index = 1;
            dataStmt.setString(index++, vectorLiteral);
            dataStmt.setObject(index++, categoryId);
            dataStmt.setObject(index++, accountId);
            dataStmt.setObject(index++, userId);
            dataStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            dataStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasTypeFilter) {
                dataStmt.setString(index++, typeFilter);
            }

            dataStmt.setInt(index++, pagination.getPageLimit());
            dataStmt.setInt(index, pagination.getOffset());

            ResultSet rs = dataStmt.executeQuery();

            while (rs.next()) {
                list.add(mapItem(rs));
            }
        } catch (SQLException e) {
            System.err.println("Fail to list items by semantic search within category and account: " + e.getMessage());
        }

        return new PaginatedResponseDTO<>(list, totalItems, pagination.getPage(), pagination.getPageLimit());
    }

    public PaginatedResponseDTO<Item> getByAccountId(UUID accountId, UUID userId, String nameFilter, String typeFilter, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        List<Item> list = new ArrayList<>();
        long totalItems = 0;
        boolean hasNameFilter = nameFilter != null && !nameFilter.isBlank();
        boolean hasTypeFilter = typeFilter != null && !typeFilter.isBlank();

        StringBuilder countQuery = new StringBuilder("SELECT COUNT(*) FROM items WHERE account_id = ? AND user_id = ? AND date BETWEEN ? AND ?");
        if (hasNameFilter) {
            countQuery.append(" AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))");
        }
        if (hasTypeFilter) {
            countQuery.append(" AND type = ?::item_type");
        }

        StringBuilder dataQuery = new StringBuilder("SELECT * FROM items WHERE account_id = ? AND user_id = ? AND date BETWEEN ? AND ?");
        if (hasNameFilter) {
            dataQuery.append(" AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))");
        }
        if (hasTypeFilter) {
            dataQuery.append(" AND type = ?::item_type");
        }
        dataQuery.append(" ORDER BY date DESC LIMIT ? OFFSET ?");

        try (Connection connection = dataSource.getConnection();
             PreparedStatement countStmt = connection.prepareStatement(countQuery.toString())) {
            int index = 1;
            countStmt.setObject(index++, accountId);
            countStmt.setObject(index++, userId);
            countStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            countStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasNameFilter) {
                countStmt.setString(index++, "%" + nameFilter + "%");
                countStmt.setString(index++, "%" + nameFilter + "%");
            }

            if (hasTypeFilter) {
                countStmt.setString(index++, typeFilter);
            }

            ResultSet rs = countStmt.executeQuery();
            if (rs.next()) {
                totalItems = rs.getLong(1);
            }
        } catch (SQLException e) {
            System.err.println("Fail to count items by account: " + e.getMessage());
        }

        try (Connection connection = dataSource.getConnection();
             PreparedStatement dataStmt = connection.prepareStatement(dataQuery.toString())) {
            int index = 1;
            dataStmt.setObject(index++, accountId);
            dataStmt.setObject(index++, userId);
            dataStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            dataStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasNameFilter) {
                dataStmt.setString(index++, "%" + nameFilter + "%");
                dataStmt.setString(index++, "%" + nameFilter + "%");
            }

            if (hasTypeFilter) {
                dataStmt.setString(index++, typeFilter);
            }

            dataStmt.setInt(index++, pagination.getPageLimit());
            dataStmt.setInt(index, pagination.getOffset());

            ResultSet rs = dataStmt.executeQuery();

            while (rs.next()) {
                list.add(mapItem(rs));
            }
        } catch (SQLException e) {
            System.err.println("Fail to list items by account: " + e.getMessage());
        }

        return new PaginatedResponseDTO<>(list, totalItems, pagination.getPage(), pagination.getPageLimit());
    }

    public PaginatedResponseDTO<Item> getByAccountIdSemantic(UUID accountId, UUID userId, float[] embedding, String typeFilter, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        List<Item> list = new ArrayList<>();
        long totalItems = 0;
        boolean hasTypeFilter = typeFilter != null && !typeFilter.isBlank();
        String vectorLiteral = VectorUtils.toPgVectorLiteral(embedding);
        if (vectorLiteral == null) {
            return new PaginatedResponseDTO<>(list, totalItems, pagination.getPage(), pagination.getPageLimit());
        }

        StringBuilder countQuery = new StringBuilder("SELECT COUNT(*) FROM items WHERE account_id = ? AND user_id = ? AND search_embedding IS NOT NULL AND date BETWEEN ? AND ?");
        if (hasTypeFilter) {
            countQuery.append(" AND type = ?::item_type");
        }

        StringBuilder dataQuery = new StringBuilder("SELECT *, (search_embedding <=> ?::vector) AS distance FROM items WHERE account_id = ? AND user_id = ? AND search_embedding IS NOT NULL AND date BETWEEN ? AND ?");
        if (hasTypeFilter) {
            dataQuery.append(" AND type = ?::item_type");
        }
        dataQuery.append(" ORDER BY distance ASC LIMIT ? OFFSET ?");

        try (Connection connection = dataSource.getConnection();
             PreparedStatement countStmt = connection.prepareStatement(countQuery.toString())) {
            int index = 1;
            countStmt.setObject(index++, accountId);
            countStmt.setObject(index++, userId);
            countStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            countStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasTypeFilter) {
                countStmt.setString(index++, typeFilter);
            }

            ResultSet rs = countStmt.executeQuery();
            if (rs.next()) {
                totalItems = rs.getLong(1);
            }
        } catch (SQLException e) {
            System.err.println("Fail to count items by semantic search within account: " + e.getMessage());
        }

        try (Connection connection = dataSource.getConnection();
             PreparedStatement dataStmt = connection.prepareStatement(dataQuery.toString())) {
            int index = 1;
            dataStmt.setString(index++, vectorLiteral);
            dataStmt.setObject(index++, accountId);
            dataStmt.setObject(index++, userId);
            dataStmt.setDate(index++, Date.valueOf(dateRange.getStartDate()));
            dataStmt.setDate(index++, Date.valueOf(dateRange.getEndDate()));

            if (hasTypeFilter) {
                dataStmt.setString(index++, typeFilter);
            }

            dataStmt.setInt(index++, pagination.getPageLimit());
            dataStmt.setInt(index, pagination.getOffset());

            ResultSet rs = dataStmt.executeQuery();

            while (rs.next()) {
                list.add(mapItem(rs));
            }
        } catch (SQLException e) {
            System.err.println("Fail to list items by semantic search within account: " + e.getMessage());
        }

        return new PaginatedResponseDTO<>(list, totalItems, pagination.getPage(), pagination.getPageLimit());
    }

    private Item mapItem(ResultSet rs) throws SQLException {
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
        item.setSearchEmbedding(VectorUtils.parsePgVector(rs.getObject("search_embedding")));
        return item;
    }
}
