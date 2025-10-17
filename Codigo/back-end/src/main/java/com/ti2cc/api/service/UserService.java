package com.ti2cc.api.service;

import com.ti2cc.api.dao.UserDAO;
import com.ti2cc.api.model.User;

import java.sql.Connection;
import java.util.List;

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

    public User findUserById(int id) {
        if (id <= 0) {
            System.err.println("Invalid user ID.");
            return null;
        }

        return userDAO.getById(id);
    }

    public boolean updateUser(User user) {
        if (user == null || user.getId() <= 0) {
            System.err.println("Invalid user data for update.");
            return false;
        }

        if (user.getName() == null && user.getEmail() == null) {
            System.err.println("No fields to update for user ID: " + user.getId());
            return false;
        }

        return userDAO.update(user);
    }

    public boolean deleteUser(int id) {
        if (id <= 0) {
            System.err.println("Invalid user ID for deletion.");
            return false;
        }

        return userDAO.delete(id);
    }
}