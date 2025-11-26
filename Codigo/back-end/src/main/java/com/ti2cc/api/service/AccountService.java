package com.ti2cc.api.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.ti2cc.api.dao.AccountDAO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Account;

public class AccountService {

    private final AccountDAO accountDAO;
    private final EmbeddingService embeddingService;

    public AccountService(AccountDAO accountDAO, EmbeddingService embeddingService) {
        this.accountDAO = accountDAO;
        this.embeddingService = embeddingService;
    }

    public boolean createAccount(Account account) {
        if (!isAccountValidForCreation(account)) {
            return false;
        }

        if (account.getBalance() < 0) {
            System.err.println("Initial balance cannot be negative.");
            return false;
        }

        if (account.getId() == null) {
            account.setId(UUID.randomUUID());
        }

        if (account.getCreatedAt() == null) {
            account.setCreatedAt(OffsetDateTime.now());
        }

        String searchText = buildSearchText(account.getName(), account.getFinancialInstitution());
        float[] embedding = embeddingService.generateEmbedding(searchText);
        if (embedding == null) {
            System.err.println("Failed to generate embedding for account creation.");
            return false;
        }
        account.setSearchEmbedding(embedding);

        return accountDAO.create(account);
    }

    public boolean updateAccount(Account account) {
        if (account == null || account.getId() == null) {
            System.err.println("Account ID is required for update.");
            return false;
        }

        if (account.getName() == null && account.getFinancialInstitution() == null && account.getBalance() == null) {
            System.err.println("No fields to update for account: " + account.getId());
            return false;
        }

        if (account.getName() != null || account.getFinancialInstitution() != null) {
            Account existing = accountDAO.getById(account.getId());
            if (existing == null) {
                System.err.println("Account not found for embedding update: " + account.getId());
                return false;
            }

            String nameForEmbedding = account.getName() != null ? account.getName() : existing.getName();
            String institutionForEmbedding = account.getFinancialInstitution() != null
                    ? account.getFinancialInstitution()
                    : existing.getFinancialInstitution();
            String searchText = buildSearchText(nameForEmbedding, institutionForEmbedding);

            float[] embedding = embeddingService.generateEmbedding(searchText);
            if (embedding == null) {
                System.err.println("Failed to generate embedding for account update.");
                return false;
            }
            account.setSearchEmbedding(embedding);
        }

        return accountDAO.update(account);
    }

    public Account findById(UUID accountId) {
        if (accountId == null) {
            System.err.println("Account ID cannot be null.");
            return null;
        }

        return accountDAO.getById(accountId);
    }

    public List<Account> findByUserId(UUID userId) {
        if (userId == null) {
            System.err.println("User ID cannot be null.");
            return List.of();
        }

        return accountDAO.getByUserId(userId);
    }

    public List<Account> findByUserId(UUID userId, String semanticQuery) {
        if (userId == null) {
            System.err.println("User ID cannot be null.");
            return List.of();
        }

        if (semanticQuery != null && !semanticQuery.isBlank()) {
            float[] embedding = embeddingService.generateEmbedding(semanticQuery);
            if (embedding == null) {
                System.err.println("Failed to generate embedding for semantic account search.");
                return List.of();
            }

            return accountDAO.getBySemanticSearch(userId, embedding);
        }

        return accountDAO.getByUserId(userId);
    }

    public PaginatedResponseDTO<Account> findByUserIdPaginated(UUID userId, PaginationRequestDTO pagination, String semanticQuery) {
        if (userId == null) {
            System.err.println("User ID cannot be null.");
            return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
        }

        if (semanticQuery != null && !semanticQuery.isBlank()) {
            float[] embedding = embeddingService.generateEmbedding(semanticQuery);
            if (embedding == null) {
                System.err.println("Failed to generate embedding for semantic account search (paginated).");
                return new PaginatedResponseDTO<>(List.of(), 0, pagination.getPage(), pagination.getPageLimit());
            }

            List<Account> accounts = accountDAO.getBySemanticSearchPaginated(userId, embedding, pagination.getOffset(), pagination.getPageLimit());
            long totalItems = accountDAO.countWithEmbedding(userId);
            return new PaginatedResponseDTO<>(accounts, totalItems, pagination.getPage(), pagination.getPageLimit());
        }

        List<Account> accounts = accountDAO.getByUserIdPaginated(userId, pagination.getOffset(), pagination.getPageLimit());
        long totalItems = accountDAO.countByUserId(userId);

        return new PaginatedResponseDTO<>(accounts, totalItems, pagination.getPage(), pagination.getPageLimit());
    }

    public boolean deleteAccount(UUID accountId) {
        if (accountId == null) {
            System.err.println("Account ID cannot be null.");
            return false;
        }

        return accountDAO.delete(accountId);
    }

    public boolean increaseBalance(UUID accountId, double amount) {
        if (!isValidBalanceOperation(accountId, amount)) {
            return false;
        }

        return accountDAO.increaseBalance(accountId, amount);
    }

    public boolean decreaseBalance(UUID accountId, double amount) {
        if (!isValidBalanceOperation(accountId, amount)) {
            return false;
        }

        return accountDAO.decreaseBalance(accountId, amount);
    }

    private boolean isValidBalanceOperation(UUID accountId, double amount) {
        if (accountId == null) {
            System.err.println("Account ID cannot be null.");
            return false;
        }

        if (amount <= 0) {
            System.err.println("Amount must be greater than zero.");
            return false;
        }

        return true;
    }

    private boolean isAccountValidForCreation(Account account) {
        if (account == null) {
            System.err.println("Account cannot be null.");
            return false;
        }

        if (account.getName() == null || account.getName().trim().isEmpty()) {
            System.err.println("Account name cannot be empty.");
            return false;
        }

        if (account.getUserId() == null) {
            System.err.println("Account user ID cannot be null.");
            return false;
        }

        return true;
    }

    private String buildSearchText(String name, String financialInstitution) {
        StringBuilder sb = new StringBuilder();
        if (name != null && !name.isBlank()) {
            sb.append(name.trim());
        }
        if (financialInstitution != null && !financialInstitution.isBlank()) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(financialInstitution.trim());
        }
        return sb.toString();
    }
}
