package com.ti2cc.api.service;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import com.ti2cc.api.dao.GoalDAO;
import com.ti2cc.api.dto.CreateGoalDTO;
import com.ti2cc.api.model.Account;
import com.ti2cc.api.model.Goal;

public class GoalService {

    private final GoalDAO goalDAO;
    private final AccountService accountService;
    private final EmbeddingService embeddingService;

    public GoalService(GoalDAO goalDAO, AccountService accountService, EmbeddingService embeddingService) {
        this.goalDAO = goalDAO;
        this.accountService = accountService;
        this.embeddingService = embeddingService;
    }

    public UUID createGoal(UUID userId, CreateGoalDTO dto) {
        if (userId == null) {
            System.err.println("User ID is required to create a goal.");
            return null;
        }

        if (dto == null) {
            System.err.println("CreateGoalDTO cannot be null.");
            return null;
        }

        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            System.err.println("Goal title cannot be empty.");
            return null;
        }

        if (dto.getTargetAmount() == null || dto.getTargetAmount() <= 0) {
            System.err.println("Goal target amount must be greater than zero.");
            return null;
        }

        Account relatedAccount = null;
        if (dto.getAccountId() != null) {
            relatedAccount = accountService.findById(dto.getAccountId());
            if (relatedAccount == null || relatedAccount.getUserId() == null || !relatedAccount.getUserId().equals(userId)) {
                System.err.println("Account does not belong to the user.");
                return null;
            }
        }

        Goal goal = new Goal();
        goal.setId(UUID.randomUUID());
        goal.setUserId(userId);
        goal.setAccountId(relatedAccount != null ? relatedAccount.getId() : null);
        goal.setTitle(dto.getTitle().trim());
        goal.setDescription(dto.getDescription());
        goal.setTargetAmount(dto.getTargetAmount());
        goal.setDeadline(dto.getDeadline());

        double startingAmount = relatedAccount != null ? relatedAccount.getBalance() : 0.0;
        goal.setCurrentAmount(startingAmount);
        goal.setAchieved(startingAmount >= dto.getTargetAmount());
        OffsetDateTime now = OffsetDateTime.now();
        goal.setCreatedAt(now);
        goal.setUpdatedAt(now);

        String searchText = buildSearchText(goal.getTitle(), goal.getDescription());
        float[] embedding = embeddingService.generateEmbedding(searchText);
        if (embedding == null) {
            System.err.println("Failed to generate embedding for goal creation. Saving without it; semantic search will rank it last.");
        }
        goal.setSearchEmbedding(embedding);

        boolean created = goalDAO.create(goal);
        return created ? goal.getId() : null;
    }

    public List<Goal> listByUser(UUID userId) {
        return listByUser(userId, null);
    }

    public List<Goal> listByUser(UUID userId, String semanticQuery) {
        if (userId == null) {
            System.err.println("User ID is required to list goals.");
            return Collections.emptyList();
        }

        if (semanticQuery != null && !semanticQuery.isBlank()) {
            float[] embedding = embeddingService.generateEmbedding(semanticQuery);
            if (embedding != null) {
                return goalDAO.listBySemantic(userId, embedding);
            }
            System.err.println("Failed to generate embedding for semantic goal search. Falling back to regular listing.");
        }

        return goalDAO.listByUser(userId);
    }

    public Goal findById(UUID id) {
        if (id == null) {
            System.err.println("Goal ID is required.");
            return null;
        }

        return goalDAO.getById(id);
    }

    public boolean updateGoal(Goal goal) {
        if (goal == null || goal.getId() == null || goal.getUserId() == null) {
            System.err.println("Goal and identifiers are required for update.");
            return false;
        }

        if (goal.getTitle() == null || goal.getTitle().isBlank()) {
            System.err.println("Goal title cannot be empty when updating.");
            return false;
        }

        if (goal.getTargetAmount() == null || goal.getTargetAmount() <= 0) {
            System.err.println("Goal target amount must be greater than zero when updating.");
            return false;
        }

        if (goal.getAccountId() != null) {
            Account relatedAccount = accountService.findById(goal.getAccountId());
            if (relatedAccount == null || relatedAccount.getUserId() == null || !relatedAccount.getUserId().equals(goal.getUserId())) {
                System.err.println("Account does not belong to the user when updating goal.");
                return false;
            }
        }

        double currentAmount = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : 0.0;
        currentAmount = Math.max(0.0, currentAmount);
        goal.setCurrentAmount(currentAmount);
        goal.setAchieved(currentAmount >= goal.getTargetAmount());

        String searchText = buildSearchText(goal.getTitle(), goal.getDescription());
        float[] embedding = embeddingService.generateEmbedding(searchText);
        if (embedding == null) {
            System.err.println("Failed to generate embedding for goal update. Keeping the previous embedding.");
        }
        goal.setSearchEmbedding(embedding);

        return goalDAO.update(goal);
    }

    public boolean deleteGoal(UUID id) {
        if (id == null) {
            System.err.println("Goal ID cannot be null for deletion.");
            return false;
        }
        return goalDAO.delete(id);
    }

    public void applyAccountDelta(UUID userId, UUID accountId, double delta) {
        if (userId == null || delta == 0) {
            return;
        }

        List<Goal> impactedGoals = goalDAO.listRelevantForAccount(userId, accountId);
        for (Goal goal : impactedGoals) {
            double currentAmount = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : 0.0;
            double updatedAmount = currentAmount + delta;
            if (updatedAmount < 0) {
                updatedAmount = 0;
            }
            boolean achieved = updatedAmount >= goal.getTargetAmount();
            goalDAO.updateProgress(goal.getId(), updatedAmount, achieved);
        }
    }

    private String buildSearchText(String title, String description) {
        StringBuilder sb = new StringBuilder();
        if (title != null && !title.isBlank()) {
            sb.append(title.trim());
        }
        if (description != null && !description.isBlank()) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(description.trim());
        }
        return sb.toString();
    }
}
