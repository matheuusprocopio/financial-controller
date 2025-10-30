package com.ti2cc.api.service;

import java.util.List;
import java.util.UUID;

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

        if (item.getOwnerId() == null) {
            System.err.println("Owner ID cannot be null.");
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

        return itemDAO.create(item);
    }

    public boolean updateItem(Item item) {
        if (item == null || item.getId() == null) {
            System.err.println("Invalid item data for update.");
            return false;
        }

        if (item.getCategoryId() == null && 
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

    public List<Item> listAllItems() {
        return itemDAO.getAll();
    }

    public List<Item> listItemsByOwnerId(UUID ownerId) {
        if (ownerId == null) {
            System.err.println("Invalid owner ID.");
            return List.of();
        }

        return itemDAO.getByOwnerId(ownerId);
    }

    public List<Item> listItemsByCategoryId(UUID categoryId) {
        if (categoryId == null) {
            System.err.println("Invalid category ID.");
            return List.of();
        }

        return itemDAO.getByCategoryId(categoryId);
    }
}
