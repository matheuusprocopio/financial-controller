package com.ti2cc.api.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.ti2cc.api.dao.AccountDAO;
import com.ti2cc.api.dao.ItemDAO;
import com.ti2cc.api.dto.DateRangeDTO;
import com.ti2cc.api.dto.ItemAnalyticsRequestDTO;
import com.ti2cc.api.dto.ItemAnalyticsResponseDTO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Item;
import com.ti2cc.api.model.Item.ItemType;

public class ItemService {
    private final ItemDAO itemDAO;
    private final AccountDAO accountDAO;
    private final EmbeddingService embeddingService;

    public ItemService(ItemDAO itemDAO, AccountDAO accountDAO, EmbeddingService embeddingService) {
        this.itemDAO = itemDAO;
        this.accountDAO = accountDAO;
        this.embeddingService = embeddingService;
    }

    public boolean createItem(Item item) {
        return createItem(item, false);
    }

    public boolean createItem(Item item, boolean duplicateConfirmed) {
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

        List<Item> duplicates = findPossibleDuplicates(item);
        if (!duplicateConfirmed && !duplicates.isEmpty()) throw new PossibleDuplicateException(duplicates);

        if (item.getId() == null) {
            item.setId(UUID.randomUUID());
        }

        float[] embedding = item.getSearchEmbedding();
        if (embedding == null) {
            System.err.println("Failed to generate embedding for item creation. Saving without it; semantic search will rank it last.");
        }
        item.setSearchEmbedding(embedding);

        boolean created = itemDAO.create(item);
        
        if (created) {
            if (item.getType() == ItemType.income) {
                accountDAO.increaseBalance(item.getAccountId(), item.getAmount());
            } else if (item.getType() == ItemType.expense) {
                accountDAO.decreaseBalance(item.getAccountId(), item.getAmount());
            }
        }
        
        return created;
    }

    public List<Item> findPossibleDuplicates(Item item) {
        if (item.getUserId() == null || item.getAccountId() == null || item.getDate() == null
                || item.getType() == null || item.getAmount() == null) return List.of();
        List<Item> candidates = itemDAO.findDuplicateCandidates(item);
        if (candidates.isEmpty()) return List.of();
        List<Item> textMatches = candidates.stream()
                .filter(candidate -> ItemDuplicateMatcher.matches(item, candidate)).toList();
        if (!textMatches.isEmpty()) return textMatches;
        if (item.getSearchEmbedding() == null) {
            item.setSearchEmbedding(embeddingService.generateEmbedding(buildSearchTerm(item.getName(), item.getDescription())));
        }
        return candidates.stream().filter(candidate -> ItemDuplicateMatcher.matches(item, candidate)).toList();
    }

    public List<Integer> findEarlierBatchDuplicates(List<Item> items, int index) {
        List<Integer> matches = new java.util.ArrayList<>();
        for (int i = 0; i < index; i++) {
            Item incoming = items.get(index);
            Item earlier = items.get(i);
            if (!ItemDuplicateMatcher.sameFacts(incoming, earlier)) continue;
            if (ItemDuplicateMatcher.matches(incoming, earlier)) {
                matches.add(i);
                continue;
            }
            if (incoming.getSearchEmbedding() == null) incoming.setSearchEmbedding(
                    embeddingService.generateEmbedding(buildSearchTerm(incoming.getName(), incoming.getDescription())));
            if (earlier.getSearchEmbedding() == null) earlier.setSearchEmbedding(
                    embeddingService.generateEmbedding(buildSearchTerm(earlier.getName(), earlier.getDescription())));
            if (ItemDuplicateMatcher.matches(incoming, earlier)) matches.add(i);
        }
        return matches;
    }

    public static class PossibleDuplicateException extends RuntimeException {
        private final List<Item> matches;
        public PossibleDuplicateException(List<Item> matches) {
            super("Possible duplicate transaction");
            this.matches = matches;
        }
        public List<Item> getMatches() { return matches; }
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

        if (item.getName() != null || item.getDescription() != null) {
            String newName = item.getName() != null ? item.getName() : oldItem.getName();
            String newDescription = item.getDescription() != null ? item.getDescription() : oldItem.getDescription();
            String searchTerm = buildSearchTerm(newName, newDescription);
            float[] embedding = embeddingService.generateEmbedding(searchTerm);
            if (embedding == null) {
                System.err.println("Failed to generate embedding for item update. Keeping the previous embedding.");
            }
            item.setSearchEmbedding(embedding);
        }

        boolean updated = itemDAO.update(item);
        
        if (updated) {
            if (oldItem.getType() == ItemType.income) {
                accountDAO.decreaseBalance(oldItem.getAccountId(), oldItem.getAmount());
            } else if (oldItem.getType() == ItemType.expense) {
                accountDAO.increaseBalance(oldItem.getAccountId(), oldItem.getAmount());
            }
            
            UUID newAccountId = item.getAccountId() != null ? item.getAccountId() : oldItem.getAccountId();
            Double newAmount = item.getAmount() != null ? item.getAmount() : oldItem.getAmount();
            ItemType newType = item.getType() != null ? item.getType() : oldItem.getType();
            
            if (newType == ItemType.income) {
                accountDAO.increaseBalance(newAccountId, newAmount);
            } else if (newType == ItemType.expense) {
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
            if (item.getType() == ItemType.income) {
                accountDAO.decreaseBalance(item.getAccountId(), item.getAmount());
            } else if (item.getType() == ItemType.expense) {
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

    public PaginatedResponseDTO<Item> listItemsByUserId(UUID userId, String nameFilter, String typeFilter, String semanticQuery, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        if (userId == null) {
            System.err.println("Invalid user ID.");
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        String sanitizedFilter = (nameFilter != null && !nameFilter.isBlank()) ? nameFilter.trim() : null;
        String sanitizedTypeFilter = (typeFilter != null && !typeFilter.isBlank()) ? typeFilter.trim() : null;
        String sanitizedSemanticQuery = (semanticQuery != null && !semanticQuery.isBlank()) ? semanticQuery.trim() : null;

        if (sanitizedSemanticQuery != null) {
            float[] embedding = embeddingService.generateEmbedding(sanitizedSemanticQuery);
            if (embedding != null) {
                return itemDAO.getByUserIdSemantic(userId, embedding, sanitizedTypeFilter, dateRange, pagination);
            }
            System.err.println("Failed to generate embedding for semantic item search. Falling back to regular listing.");
        }

        return itemDAO.getByUserId(userId, sanitizedFilter != null ? sanitizedFilter : sanitizedSemanticQuery, sanitizedTypeFilter, dateRange, pagination);
    }

    public PaginatedResponseDTO<Item> listItemsByCategoryId(UUID categoryId, UUID userId, String nameFilter, String typeFilter, String semanticQuery, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
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
        String sanitizedSemanticQuery = (semanticQuery != null && !semanticQuery.isBlank()) ? semanticQuery.trim() : null;

        if (sanitizedSemanticQuery != null) {
            float[] embedding = embeddingService.generateEmbedding(sanitizedSemanticQuery);
            if (embedding != null) {
                return itemDAO.getByCategoryIdSemantic(categoryId, userId, embedding, sanitizedTypeFilter, dateRange, pagination);
            }
            System.err.println("Failed to generate embedding for semantic item search by category. Falling back to regular listing.");
        }

        return itemDAO.getByCategoryId(categoryId, userId, sanitizedFilter != null ? sanitizedFilter : sanitizedSemanticQuery, sanitizedTypeFilter, dateRange, pagination);
    }

    public PaginatedResponseDTO<Item> listItemsByCategoryAndAccount(UUID categoryId, UUID accountId, UUID userId, String nameFilter, String typeFilter, String semanticQuery, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
        if (categoryId == null) {
            System.err.println("Invalid category ID.");
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

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
        String sanitizedSemanticQuery = (semanticQuery != null && !semanticQuery.isBlank()) ? semanticQuery.trim() : null;

        if (sanitizedSemanticQuery != null) {
            float[] embedding = embeddingService.generateEmbedding(sanitizedSemanticQuery);
            if (embedding != null) {
                return itemDAO.getByCategoryAndAccountSemantic(categoryId, accountId, userId, embedding, sanitizedTypeFilter, dateRange, pagination);
            }
            System.err.println("Failed to generate embedding for semantic item search by category and account. Falling back to regular listing.");
        }

        return itemDAO.getByCategoryAndAccount(categoryId, accountId, userId, sanitizedFilter != null ? sanitizedFilter : sanitizedSemanticQuery, sanitizedTypeFilter, dateRange, pagination);
    }

    public PaginatedResponseDTO<Item> listItemsByAccountId(UUID accountId, UUID userId, String nameFilter, String typeFilter, String semanticQuery, DateRangeDTO dateRange, PaginationRequestDTO pagination) {
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
        String sanitizedSemanticQuery = (semanticQuery != null && !semanticQuery.isBlank()) ? semanticQuery.trim() : null;

        if (sanitizedSemanticQuery != null) {
            float[] embedding = embeddingService.generateEmbedding(sanitizedSemanticQuery);
            if (embedding != null) {
                return itemDAO.getByAccountIdSemantic(accountId, userId, embedding, sanitizedTypeFilter, dateRange, pagination);
            }
            System.err.println("Failed to generate embedding for semantic item search by account. Falling back to regular listing.");
        }

        return itemDAO.getByAccountId(accountId, userId, sanitizedFilter != null ? sanitizedFilter : sanitizedSemanticQuery, sanitizedTypeFilter, dateRange, pagination);
    }

    private String buildSearchTerm(String name, String description) {
        StringBuilder sb = new StringBuilder();
        if (name != null && !name.isBlank()) {
            sb.append(name.trim());
        }
        if (description != null && !description.isBlank()) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(description.trim());
        }
        return sb.toString();
    }
    public ItemAnalyticsResponseDTO getAnalytics(ItemAnalyticsRequestDTO req) {
        
    if (req == null || req.getUserId() == null) {
        throw new IllegalArgumentException("Requisição de analytics inválida: userId é obrigatório.");
    }

    if (req.getEndDate() == null) {
        req.setEndDate(LocalDate.now());
    }
    if (req.getStartDate() == null) {
        req.setStartDate(req.getEndDate().minusMonths(6));
    }

    if (req.getGroupBy() == null || req.getGroupBy().isEmpty()) {
        req.setGroupBy(List.of(ItemAnalyticsRequestDTO.GroupBy.month));
    }

    if (req.getMetric() == null) {
        req.setMetric(ItemAnalyticsRequestDTO.Metric.total_expenses);
    }

    return itemDAO.getAnalytics(req);
}

}
