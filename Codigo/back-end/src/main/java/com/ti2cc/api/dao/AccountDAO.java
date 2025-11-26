package com.ti2cc.api.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.ti2cc.api.model.Account;

public class AccountDAO {
    private final Connection connection;

    public AccountDAO(Connection connection) {
        this.connection = connection;
    }

    public boolean create(Account account) {
        String query = "INSERT INTO accounts (id, name, user_id, financial_institution, balance) VALUES (?, ?, ?, ?, ?)";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            if (account.getId() == null) {
                account.setId(UUID.randomUUID());
            }

            pstmt.setObject(1, account.getId());
            pstmt.setString(2, account.getName());
            pstmt.setObject(3, account.getUserId());
            if (account.getFinancialInstitution() != null) {
                pstmt.setString(4, account.getFinancialInstitution());
            } else {
                pstmt.setNull(4, Types.VARCHAR);
            }
            pstmt.setDouble(5, account.getBalance());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Fail to insert account: " + e.getMessage());
            return false;
        }
    }
        public boolean update(Account account) {
        StringBuilder sb = new StringBuilder("UPDATE accounts SET ");
        boolean hasPrev = false;

        if (account.getName() != null) {
            sb.append("name = ?");
            hasPrev = true;
        }

        if (account.getFinancialInstitution() != null) {
            if (hasPrev) sb.append(", ");
            sb.append("financial_institution = ?");
            hasPrev = true;
        }

        if (account.getBalance() != null) {
            if (hasPrev) sb.append(", ");
            sb.append("balance = ?");
            hasPrev = true;
        }

        sb.append(" WHERE id = ?");

        try (PreparedStatement pstmt = connection.prepareStatement(sb.toString())) {
            int paramIndex = 1;

            if (account.getName() != null) {
                pstmt.setString(paramIndex++, account.getName());
            }

            if (account.getFinancialInstitution() != null) {
                pstmt.setString(paramIndex++, account.getFinancialInstitution());
            }

            if (account.getBalance() != null) {
                pstmt.setDouble(paramIndex++, account.getBalance());
            }

            pstmt.setObject(paramIndex, account.getId());

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Fail to update account: " + e.getMessage());
            return false;
        }
    }

    public boolean delete(UUID accountId) {
        String query = "DELETE FROM accounts WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, accountId);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Fail to delete account: " + e.getMessage());
            return false;
        }
    }

    public Account getById(UUID accountId) {
        String query = "SELECT * FROM accounts WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, accountId);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapAccount(rs);
            }
        } catch (SQLException e) {
            System.err.println("Fail to retrieve account by id: " + e.getMessage());
        }

        return null;
    }

    public List<Account> getByUserId(UUID userId) {
        String query = "SELECT * FROM accounts WHERE user_id = ?";
        List<Account> accounts = new ArrayList<>();

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, userId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                accounts.add(mapAccount(rs));
            }
        } catch (SQLException e) {
            System.err.println("Fail to list user accounts: " + e.getMessage());
        }

        return accounts;
    }

    public List<Account> getByUserIdPaginated(UUID userId, int offset, int limit) {
        String query = "SELECT * FROM accounts WHERE user_id = ? ORDER BY id LIMIT ? OFFSET ?";
        List<Account> accounts = new ArrayList<>();

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, userId);
            pstmt.setInt(2, limit);
            pstmt.setInt(3, offset);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                accounts.add(mapAccount(rs));
            }
        } catch (SQLException e) {
            System.err.println("Fail to list user accounts paginated: " + e.getMessage());
        }

        return accounts;
    }

    public long countByUserId(UUID userId) {
        String query = "SELECT COUNT(*) FROM accounts WHERE user_id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setObject(1, userId);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return rs.getLong(1);
            }
        } catch (SQLException e) {
            System.err.println("Fail to count user accounts: " + e.getMessage());
        }

        return 0;
    }

    public boolean increaseBalance(UUID accountId, double amount) {
        String query = "UPDATE accounts SET balance = balance + ? WHERE id = ?";
        return executeBalanceUpdate(accountId, amount, query);
    }

    public boolean decreaseBalance(UUID accountId, double amount) {
        String query = "UPDATE accounts SET balance = balance - ? WHERE id = ?";
        return executeBalanceUpdate(accountId, amount, query);
    }

    private boolean executeBalanceUpdate(UUID accountId, double amount, String query) {
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setDouble(1, amount);
            pstmt.setObject(2, accountId);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Fail to update account balance: " + e.getMessage());
            return false;
        }
    }

    private Account mapAccount(ResultSet rs) throws SQLException {
        Account account = new Account(
                (UUID) rs.getObject("id"),
                rs.getString("name"),
                (UUID) rs.getObject("user_id"),
                rs.getString("financial_institution"),
                rs.getDouble("balance")
        );
        account.setCreatedAt(rs.getObject("created_at", OffsetDateTime.class));
        return account;
    }
}
