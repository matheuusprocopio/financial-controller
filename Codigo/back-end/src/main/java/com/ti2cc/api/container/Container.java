package com.ti2cc.api.container;

import java.sql.Connection;

import com.ti2cc.api.controller.AccountController;
import com.ti2cc.api.controller.AuthController;
import com.ti2cc.api.controller.CategoryController;
import com.ti2cc.api.controller.ItemController;
import com.ti2cc.api.controller.UserController;
import com.ti2cc.api.dao.AccountDAO;
import com.ti2cc.api.dao.CategoryDAO;
import com.ti2cc.api.dao.ItemDAO;
import com.ti2cc.api.dao.UserDAO;
import com.ti2cc.api.factory.PostgresFactory;
import com.ti2cc.api.routes.AccountRoutes;
import com.ti2cc.api.routes.AuthRoutes;
import com.ti2cc.api.routes.CategoryRoutes;
import com.ti2cc.api.routes.ItemRoutes;
import com.ti2cc.api.routes.UserRoutes;
import com.ti2cc.api.service.AccountService;
import com.ti2cc.api.service.CategoryService;
import com.ti2cc.api.service.FirebaseAuthService;
import com.ti2cc.api.service.ItemService;
import com.ti2cc.api.service.SessionService;
import com.ti2cc.api.service.UserService;

public class Container {
    public static void register() {
        Connection postgresConn = PostgresFactory.getConnection();

        CategoryDAO categoryDAO = new CategoryDAO(postgresConn);
        AccountDAO accountDAO = new AccountDAO(postgresConn);
        UserDAO userDAO = new UserDAO(postgresConn);
        ItemDAO itemDAO = new ItemDAO(postgresConn);


        CategoryService categoryService = new CategoryService(categoryDAO);
        AccountService accountService = new AccountService(accountDAO);
        UserService userService = new UserService(userDAO);
        ItemService itemService = new ItemService(itemDAO);

        // Serviços de autenticação
        FirebaseAuthService firebaseAuthService;
        try {
            firebaseAuthService = new FirebaseAuthService();
        } catch (Exception e) {
            System.err.println("AVISO: Firebase não inicializado, autenticação pode não funcionar: " + e.getMessage());
            firebaseAuthService = null;
        }
        SessionService sessionService = new SessionService();

        CategoryController categoryController = new CategoryController(categoryService);
        AccountController accountController = new AccountController(accountService);
        UserController userController = new UserController(userService);
        ItemController itemController = new ItemController(itemService);
        AuthController authController = new AuthController(firebaseAuthService, userService, sessionService);


        CategoryRoutes categoryRoutes = new CategoryRoutes(categoryController);
        AccountRoutes accountRoutes = new AccountRoutes(accountController);
        UserRoutes userRoutes = new UserRoutes(userController);
        ItemRoutes itemRoutes = new ItemRoutes(itemController);
        AuthRoutes authRoutes = new AuthRoutes(authController);

        
        categoryRoutes.register();
        accountRoutes.register();
        userRoutes.register();
        itemRoutes.register();
        authRoutes.register();
    }
}
