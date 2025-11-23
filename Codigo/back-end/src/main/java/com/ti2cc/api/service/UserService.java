package com.ti2cc.api.service;

import com.ti2cc.api.dao.UserDAO;
import com.ti2cc.api.model.User;

import java.util.List;
import java.util.UUID;

public class UserService {

    private final UserDAO userDAO;

    public UserService(UserDAO userDAO) {
        this.userDAO = userDAO;
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

        return userDAO.create(user);
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
