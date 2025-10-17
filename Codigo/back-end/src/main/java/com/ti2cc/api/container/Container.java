package com.ti2cc.api.container;

import com.ti2cc.api.controller.CategoryController;
import com.ti2cc.api.controller.UserController;
import com.ti2cc.api.dao.CategoryDAO;
import com.ti2cc.api.dao.UserDAO;
import com.ti2cc.api.factory.PostgresFactory;
import com.ti2cc.api.routes.CategoryRoutes;
import com.ti2cc.api.routes.UserRoutes;
import com.ti2cc.api.service.CategoryService;
import com.ti2cc.api.service.UserService;

import java.sql.Connection;

public class Container {
    public static void register() {
        Connection postgresConn = PostgresFactory.getConnection();

        CategoryDAO categoryDAO = new CategoryDAO(postgresConn);
        UserDAO userDAO = new UserDAO(postgresConn);

        CategoryService categoryService = new CategoryService(categoryDAO);
        UserService userService = new UserService(userDAO);

        CategoryController categoryController = new CategoryController(categoryService);
        UserController userController = new UserController(userService);

        CategoryRoutes categoryRoutes = new CategoryRoutes(categoryController);
        UserRoutes userRoutes = new UserRoutes(userController);

        categoryRoutes.register();
        userRoutes.register();
    }
}
