package com.ti2cc.api.controller;

import com.google.gson.Gson;
import com.ti2cc.api.model.Account;
import com.ti2cc.api.service.AccountService;

import java.util.List;
import java.util.UUID;

public class AccountController {
    private final AccountService accountService;
    private final Gson gson = new Gson();

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    public String create(String body) {
        Account account = gson.fromJson(body, Account.class);
        boolean created = accountService.createAccount(account);

        if (created) {
            return gson.toJson(account);
        }

        return gson.toJson("Failed to create account.");
    }

    public String getById(String accountId) {
        try {
            UUID id = UUID.fromString(accountId);
            Account account = accountService.findById(id);

            if (account == null) {
                return gson.toJson("Account not found.");
            }

            return gson.toJson(account);
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid ID format.");
        }
    }

    public String getByUserId(String userId) {
        try {
            UUID id = UUID.fromString(userId);
            List<Account> accounts = accountService.findByUserId(id);
            return gson.toJson(accounts);
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid user ID format.");
        }
    }

    public String delete(String accountId) {
        try {
            UUID id = UUID.fromString(accountId);
            boolean deleted = accountService.deleteAccount(id);

            if (deleted) {
                return gson.toJson("Account deleted successfully.");
            }

            return gson.toJson("Account not found.");
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid ID format.");
        }
    }
}
