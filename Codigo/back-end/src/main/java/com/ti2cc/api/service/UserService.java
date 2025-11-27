package com.ti2cc.api.service;

import java.util.List;
import java.util.UUID;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.ti2cc.api.dao.UserDAO;
import com.ti2cc.api.model.User;

public class UserService {

    private final UserDAO userDAO;
    private final ChatService chatService;
    private final MessageService messageService;

    public UserService(UserDAO userDAO, ChatService chatService, MessageService messageService) {
        this.userDAO = userDAO;
        this.chatService = chatService;
        this.messageService = messageService;
    }

    public boolean createUser(User user) {
        if (user == null) {
            System.err.println("User cannot be null.");
            return false;
        }

        if (user.getName() == null || user.getName().trim().isEmpty()) {
            System.err.println("User name cannot be empty.");
            return false;
        }

        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            System.err.println("User email cannot be empty.");
            return false;
        }

        boolean created = userDAO.create(user);

        if (created && chatService != null) {
            UUID chatId = chatService.createChat(user.getId(), "Hello World");
            if (chatId != null) {
                createOnboardingTutorialMessage(user.getId(), chatId);
            }
        }

        return created;
    }

private void createOnboardingTutorialMessage(UUID userId, UUID chatId) {
        if (messageService == null || userId == null || chatId == null) {
            return;
        }

        try {
            JsonArray parts = new JsonArray();
            JsonObject tutorialActions = new JsonObject();
            tutorialActions.addProperty("type", "tutorial-actions");
            tutorialActions.addProperty("title", "Bem-vindo ao Financial Controller!");
            tutorialActions.addProperty("subtitle", "Clique em um dos comandos abaixo ou escreva com suas palavras para começar.");

            JsonArray actions = new JsonArray();

            JsonObject createAccount = new JsonObject();
            createAccount.addProperty("label", "Criar conta");
            createAccount.addProperty("description", "Cadastre sua primeira conta bancária ou carteira.");
            createAccount.addProperty("prompt", "Crie uma conta");
            actions.add(createAccount);

            JsonObject createCategory = new JsonObject();
            createCategory.addProperty("label", "Criar categoria");
            createCategory.addProperty("description", "Separe gastos como Alimentação, Transporte ou Lazer.");
            createCategory.addProperty("prompt", "Cadastre uma categoria");
            actions.add(createCategory);

            JsonObject registerExpense = new JsonObject();
            registerExpense.addProperty("label", "Registrar gasto");
            registerExpense.addProperty("description", "Informe valor, data, conta e categoria para acompanhar o orçamento.");
            registerExpense.addProperty("prompt", "Registre um gasto");
            actions.add(registerExpense);

            JsonObject registerGoal = new JsonObject();
            registerGoal.addProperty("label", "Registrar meta");
            registerGoal.addProperty("description", "Defina um tema, um valor alvo e um prazo para conquistar seus objetivos.");
            registerGoal.addProperty("prompt", "Registre uma meta");
            actions.add(registerGoal);

            tutorialActions.add("actions", actions);
            tutorialActions.addProperty("aiInstruction", 
                "AI assistant: use these onboarding prompts as ready-made commands. Guide the user through accounts, categories, and first expenses without repeating this block unless onboarding is explicitly requested.");
            
            parts.add(tutorialActions);

            messageService.createMessage(chatId, userId, null, "assistant", parts);

        } catch (Exception ex) {
            System.err.println("Failed to create onboarding tutorial message: " + ex.getMessage());
        }
    }

    public List<User> listAllUsers() {
        return userDAO.getAll();
    }

    public User findUserById(UUID id) {
        if (id == null) {
            System.err.println("Invalid user ID.");
            return null;
        }

        return userDAO.getById(id);
    }

    public User findUserByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            System.err.println("Invalid user email.");
            return null;
        }

        return userDAO.findByEmail(email);
    }

    public boolean updateUser(User user) {
        if (user == null || user.getId() == null) {
            System.err.println("Invalid user data for update.");
            return false;
        }

        if (user.getName() == null && user.getEmail() == null) {
            System.err.println("No fields to update for user ID: " + user.getId());
            return false;
        }

        return userDAO.update(user);
    }

    public boolean deleteUser(UUID id) {
        if (id == null) {
            System.err.println("Invalid user ID for deletion.");
            return false;
        }

        return userDAO.delete(id);
    }
}
