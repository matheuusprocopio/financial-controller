package com.ti2cc.api.container;

import com.ti2cc.api.controller.AccountController;
import com.ti2cc.api.controller.CategoryController;
import com.ti2cc.api.controller.UserController;
import com.ti2cc.api.dao.AccountDAO;
import com.ti2cc.api.dao.CategoryDAO;
import com.ti2cc.api.dao.UserDAO;
import com.ti2cc.api.factory.PostgresFactory;
import com.ti2cc.api.routes.AccountRoutes;
import com.ti2cc.api.routes.CategoryRoutes;
import com.ti2cc.api.routes.UserRoutes;
import com.ti2cc.api.service.AccountService;
import com.ti2cc.api.service.CategoryService;
import com.ti2cc.api.service.UserService;

import java.sql.Connection;

public class Container {
    public static void register() {
        Connection postgresConn = PostgresFactory.getConnection();

        CategoryDAO categoryDAO = new CategoryDAO(postgresConn);
        AccountDAO accountDAO = new AccountDAO(postgresConn);
        UserDAO userDAO = new UserDAO(postgresConn);

        CategoryService categoryService = new CategoryService(categoryDAO);
        AccountService accountService = new AccountService(accountDAO);
        UserService userService = new UserService(userDAO);

        CategoryController categoryController = new CategoryController(categoryService);
        AccountController accountController = new AccountController(accountService);
        UserController userController = new UserController(userService);

        CategoryRoutes categoryRoutes = new CategoryRoutes(categoryController);
        AccountRoutes accountRoutes = new AccountRoutes(accountController);
        UserRoutes userRoutes = new UserRoutes(userController);

        categoryRoutes.register();
        accountRoutes.register();
        userRoutes.register();
    }
}
