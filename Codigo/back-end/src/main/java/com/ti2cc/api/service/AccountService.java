package com.ti2cc.api.service;

import com.ti2cc.api.dao.AccountDAO;
import com.ti2cc.api.model.Account;

import java.util.List;
import java.util.UUID;

public class AccountService {
    private final AccountDAO accountDAO;

    public AccountService(AccountDAO accountDAO) {
        this.accountDAO = accountDAO;
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

        return accountDAO.create(account);
    }

    public boolean updateAccount(Account account) {
        if (account == null || account.getId() == null) {
            System.err.println("Account ID is required for update.");
            return false;
        }

        if (account.getName() == null && account.getFinancialInstitution() == null) {
            System.err.println("No fields to update for account: " + account.getId());
            return false;
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
}
