package com.ti2cc.api.controller;

import java.util.List;
import java.util.UUID;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.ti2cc.api.dto.AccountUpdateDTO;
import com.ti2cc.api.dto.CreateAccountDTO;
import com.ti2cc.api.dto.PaginatedResponseDTO;
import com.ti2cc.api.dto.PaginationRequestDTO;
import com.ti2cc.api.model.Account;
import com.ti2cc.api.service.AccountService;

import spark.Request;
import spark.Response;

public class AccountController {

    private final AccountService accountService;
    private final Gson gson = new Gson();

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    public Object create(Request req, Response res) {
        res.type("application/json");
        try {
            CreateAccountDTO dto = gson.fromJson(req.body(), CreateAccountDTO.class);
            if (dto == null) {
                res.status(400);
                return gson.toJson("Request body is required.");
            }

            Account account = new Account();
            account.setName(dto.getName());
            account.setUserId(dto.getUserId());
            account.setFinancialInstitution(dto.getFinancialInstitution());
            account.setBalance(dto.getBalance() != null ? dto.getBalance() : 0.0);
            boolean created = accountService.createAccount(account);   

            if (created) {
                res.status(201);
                return gson.toJson(account);
            }

            res.status(400);
            return gson.toJson("Failed to create account.");
        } catch (JsonSyntaxException e) {
            res.status(400);
            return gson.toJson("Invalid JSON format: " + e.getMessage());
        }
    }

    public Object getById(Request req, Response res) {
        res.type("application/json");
        try {
            UUID id = UUID.fromString(req.params(":accountId"));
            Account account = accountService.findById(id);

            if (account == null) {
                res.status(404);
                return gson.toJson("Account not found.");
            }

            res.status(200);
            return gson.toJson(account);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid ID format.");
        }
    }

    public Object listByUser(Request req, Response res) {
        res.type("application/json");
        String userIdParam = req.queryParams("user_id");
        if (userIdParam == null) {
            res.status(400);
            return gson.toJson("Query parameter 'user_id' is required.");
        }

        try {
            UUID id = UUID.fromString(userIdParam);
            List<Account> accounts = accountService.findByUserId(id);
            res.status(200);
            return gson.toJson(accounts);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid user ID format.");
        }
    }

    public Object listByUserPaginated(Request req, Response res) {
        res.type("application/json");
        String userIdParam = req.queryParams("user_id");
        if (userIdParam == null) {
            res.status(400);
            return gson.toJson("Query parameter 'user_id' is required.");
        }

        try {
            UUID userId = UUID.fromString(userIdParam);
            
            int page = req.queryParams("page") != null ? Integer.parseInt(req.queryParams("page")) : PaginationRequestDTO.DEFAULT_PAGE;
            int size = req.queryParams("size") != null ? Integer.parseInt(req.queryParams("size")) : PaginationRequestDTO.DEFAULT_PAGE_LIMIT;
            
            PaginationRequestDTO pagination = new PaginationRequestDTO(page, size);
            PaginatedResponseDTO<Account> paginatedAccounts = accountService.findByUserIdPaginated(userId, pagination);
            
            res.status(200);
            return gson.toJson(paginatedAccounts);
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid parameters format.");
        }
    }

    public Object update(Request request, Response response) {
        response.type("application/json");
        try {
            UUID id = UUID.fromString(request.params(":accountId"));
            AccountUpdateDTO dto = gson.fromJson(request.body(), AccountUpdateDTO.class);

            Account account = new Account();
            account.setId(id);
            account.setName(dto.getName());
            account.setFinancialInstitution(dto.getFinancialInstitution());
            account.setBalance(dto.getBalance());

            boolean updated = accountService.updateAccount(account);
            if (updated) {
                response.status(200);
                return gson.toJson("Account updated successfully.");
            } else {
                response.status(400);
                return gson.toJson("Failed to update account.");
            }
        } catch (IllegalArgumentException e) {
            response.status(400);
            return gson.toJson("Invalid ID format.");
        } catch (JsonSyntaxException e) {
            response.status(400);
            return gson.toJson("Invalid JSON format: " + e.getMessage());
        }
    }

    public Object delete(Request req, Response res) {
        res.type("application/json");
        try {
            UUID id = UUID.fromString(req.params(":accountId"));
            boolean deleted = accountService.deleteAccount(id);

            if (deleted) {
                res.status(200);
                return gson.toJson("Account deleted successfully.");
            }

            res.status(404);
            return gson.toJson("Account not found.");
        } catch (IllegalArgumentException e) {
            res.status(400);
            return gson.toJson("Invalid ID format.");
        }
    }
}
