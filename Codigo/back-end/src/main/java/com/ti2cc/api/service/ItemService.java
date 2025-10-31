package com.ti2cc.api.service;

import java.util.List;
import java.util.UUID;

import com.ti2cc.api.dto.DateRangeDTO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.dao.ItemDAO;
import com.ti2cc.api.model.Item;

public class ItemService {
    private final ItemDAO itemDAO;

    public ItemService(ItemDAO itemDAO) {
        this.itemDAO = itemDAO;
    }

    public boolean createItem(Item item) {
        if (item == null) {
            System.err.println("Item cannot be null.");
            return false;
        }

        if (item.getCategoryId() == null) {
            System.err.println("Category ID cannot be null.");
            return false;
        }

        if (item.getUserId() == null) {
            System.err.println("User ID cannot be null.");
            return false;
        }

        if (item.getAccountId() == null) {
            System.err.println("Account ID cannot be null.");
            return false;
        }

        if (item.getName() == null || item.getName().trim().isEmpty()) {
            System.err.println("Item name cannot be empty.");
            return false;
        }

        if (item.getDescription() == null || item.getDescription().trim().isEmpty()) {
            System.err.println("Item description cannot be empty.");
            return false;
        }

        if (item.getAmount() == null) {
            System.err.println("Item amount cannot be null.");
            return false;
        }

        if (item.getDate() == null) {
            System.err.println("Item date cannot be null.");
            return false;
        }

        if (item.getType() == null) {
            System.err.println("Item type cannot be null.");
            return false;
        }

        if (item.getId() == null) {
            item.setId(UUID.randomUUID());
        }

        return itemDAO.create(item);
    }

    public boolean updateItem(Item item) {
        if (item == null || item.getId() == null) {
            System.err.println("Invalid item data for update.");
            return false;
        }

        if (item.getCategoryId() == null && 
            item.getUserId() == null &&
            item.getAccountId() == null &&
            item.getName() == null &&
            item.getDescription() == null &&
            item.getAmount() == null &&
            item.getDate() == null &&
            item.getType() == null) {
            System.err.println("No fields to update for item ID: " + item.getId());
            return false;
        }

        return itemDAO.update(item);
    }

    public boolean deleteItem(UUID id) {
        if (id == null) {
            System.err.println("Invalid item ID for deletion.");
            return false;
        }

        return itemDAO.delete(id);
    }

    public Item findItemById(UUID id) {
        if (id == null) {
            System.err.println("Invalid item ID.");
            return null;
        }

        return itemDAO.getById(id);
    }

    public PaginatedResponseDTO<Item> listItemsByUserId(UUID userId, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        if (userId == null) {
            System.err.println("Invalid user ID.");
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        return itemDAO.getByUserId(userId, dateRange, pagination);
    }

    public PaginatedResponseDTO<Item> listItemsByCategoryId(UUID categoryId, UUID userId, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        if (categoryId == null) {
            System.err.println("Invalid category ID.");
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        if (userId == null) {
            System.err.println("Invalid user ID.");
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        return itemDAO.getByCategoryId(categoryId, userId, dateRange, pagination);
    }
}
