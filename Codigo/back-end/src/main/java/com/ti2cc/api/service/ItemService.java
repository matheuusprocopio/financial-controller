package com.ti2cc.api.service;

import java.util.List;
import java.util.UUID;

import com.ti2cc.api.dao.AccountDAO;
import com.ti2cc.api.dao.ItemDAO;
import com.ti2cc.api.dto.DateRangeDTO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Item;

public class ItemService {
    private final ItemDAO itemDAO;
    private final AccountDAO accountDAO;

    public ItemService(ItemDAO itemDAO, AccountDAO accountDAO) {
        this.itemDAO = itemDAO;
        this.accountDAO = accountDAO;
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

        boolean created = itemDAO.create(item);
        
        if (created) {
            if (item.getType() == Item.ItemType.income) {
                accountDAO.increaseBalance(item.getAccountId(), item.getAmount());
            } else if (item.getType() == Item.ItemType.expense) {
                accountDAO.decreaseBalance(item.getAccountId(), item.getAmount());
            }
        }
        
        return created;
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

        Item oldItem = itemDAO.getById(item.getId());
        if (oldItem == null) {
            System.err.println("Item not found for update: " + item.getId());
            return false;
        }

        boolean updated = itemDAO.update(item);
        
        if (updated) {
            if (oldItem.getType() == Item.ItemType.income) {
                accountDAO.decreaseBalance(oldItem.getAccountId(), oldItem.getAmount());
            } else if (oldItem.getType() == Item.ItemType.expense) {
                accountDAO.increaseBalance(oldItem.getAccountId(), oldItem.getAmount());
            }
            
            UUID newAccountId = item.getAccountId() != null ? item.getAccountId() : oldItem.getAccountId();
            Double newAmount = item.getAmount() != null ? item.getAmount() : oldItem.getAmount();
            Item.ItemType newType = item.getType() != null ? item.getType() : oldItem.getType();
            
            if (newType == Item.ItemType.income) {
                accountDAO.increaseBalance(newAccountId, newAmount);
            } else if (newType == Item.ItemType.expense) {
                accountDAO.decreaseBalance(newAccountId, newAmount);
            }
        }
        
        return updated;
    }

    public boolean deleteItem(UUID id) {
        if (id == null) {
            System.err.println("Invalid item ID for deletion.");
            return false;
        }

        Item item = itemDAO.getById(id);
        if (item == null) {
            System.err.println("Item not found for deletion: " + id);
            return false;
        }

        boolean deleted = itemDAO.delete(id);
        
        if (deleted) {
            if (item.getType() == Item.ItemType.income) {
                accountDAO.decreaseBalance(item.getAccountId(), item.getAmount());
            } else if (item.getType() == Item.ItemType.expense) {
                accountDAO.increaseBalance(item.getAccountId(), item.getAmount());
            }
        }
        
        return deleted;
    }

    public Item findItemById(UUID id) {
        if (id == null) {
            System.err.println("Invalid item ID.");
            return null;
        }

        return itemDAO.getById(id);
    }

    public PaginatedResponseDTO<Item> listItemsByUserId(UUID userId, String nameFilter, String typeFilter, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        if (userId == null) {
            System.err.println("Invalid user ID.");
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        String sanitizedFilter = (nameFilter != null && !nameFilter.isBlank()) ? nameFilter.trim() : null;
        String sanitizedTypeFilter = (typeFilter != null && !typeFilter.isBlank()) ? typeFilter.trim() : null;
        return itemDAO.getByUserId(userId, sanitizedFilter, sanitizedTypeFilter, dateRange, pagination);
    }

    public PaginatedResponseDTO<Item> listItemsByCategoryId(UUID categoryId, UUID userId, String nameFilter, String typeFilter, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        if (categoryId == null) {
            System.err.println("Invalid category ID.");
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        if (userId == null) {
            System.err.println("Invalid user ID.");
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        String sanitizedFilter = (nameFilter != null && !nameFilter.isBlank()) ? nameFilter.trim() : null;
        String sanitizedTypeFilter = (typeFilter != null && !typeFilter.isBlank()) ? typeFilter.trim() : null;
        return itemDAO.getByCategoryId(categoryId, userId, sanitizedFilter, sanitizedTypeFilter, dateRange, pagination);
    }

    public PaginatedResponseDTO<Item> listItemsByAccountId(UUID accountId, UUID userId, String nameFilter, String typeFilter, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        if (accountId == null) {
            System.err.println("Invalid account ID.");
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        if (userId == null) {
            System.err.println("Invalid user ID.");
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        String sanitizedFilter = (nameFilter != null && !nameFilter.isBlank()) ? nameFilter.trim() : null;
        String sanitizedTypeFilter = (typeFilter != null && !typeFilter.isBlank()) ? typeFilter.trim() : null;
        return itemDAO.getByAccountId(accountId, userId, sanitizedFilter, sanitizedTypeFilter, dateRange, pagination);
    }
}
