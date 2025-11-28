package com.ti2cc.api.container;

import java.sql.Connection;

import com.ti2cc.api.controller.AccountController;
import com.ti2cc.api.controller.AuthController;
import com.ti2cc.api.controller.CategoryController;
import com.ti2cc.api.controller.ChatController;
import com.ti2cc.api.controller.GoalController;
import com.ti2cc.api.controller.ItemController;
import com.ti2cc.api.controller.MessageController;
import com.ti2cc.api.controller.UserController;
import com.ti2cc.api.dao.AccountDAO;
import com.ti2cc.api.dao.CategoryDAO;
import com.ti2cc.api.dao.ChatDAO;
import com.ti2cc.api.dao.GoalDAO;
import com.ti2cc.api.dao.ItemDAO;
import com.ti2cc.api.dao.MessageDAO;
import com.ti2cc.api.dao.UserDAO;
import com.ti2cc.api.factory.PostgresFactory;
import com.ti2cc.api.middleware.AuthMiddleware;
import com.ti2cc.api.routes.AccountRoutes;
import com.ti2cc.api.routes.AuthRoutes;
import com.ti2cc.api.routes.CategoryRoutes;
import com.ti2cc.api.routes.ChatRoutes;
import com.ti2cc.api.routes.GoalRoutes;
import com.ti2cc.api.routes.HealthRoutes;
import com.ti2cc.api.routes.ItemRoutes;
import com.ti2cc.api.routes.MessageRoutes;
import com.ti2cc.api.routes.UserRoutes;
import com.ti2cc.api.service.AccountService;
import com.ti2cc.api.service.CategoryService;
import com.ti2cc.api.service.ChatService;
import com.ti2cc.api.service.EmbeddingService;
import com.ti2cc.api.service.FirebaseAuthService;
import com.ti2cc.api.service.GoalService;
import com.ti2cc.api.service.ItemService;
import com.ti2cc.api.service.MessageService;
import com.ti2cc.api.service.SessionService;
import com.ti2cc.api.service.UserService;

import spark.Request;
import static spark.Spark.before;

public class Container {
    public static void register() {
        Connection postgresConn = PostgresFactory.getConnection();

        CategoryDAO categoryDAO = new CategoryDAO(postgresConn);
        AccountDAO accountDAO = new AccountDAO(postgresConn);
        UserDAO userDAO = new UserDAO(postgresConn);
        ItemDAO itemDAO = new ItemDAO(postgresConn);
        ChatDAO chatDAO = new ChatDAO(postgresConn);
        MessageDAO messageDAO = new MessageDAO(postgresConn);
        GoalDAO goalDAO = new GoalDAO(postgresConn);


        EmbeddingService embeddingService = new EmbeddingService();
        CategoryService categoryService = new CategoryService(categoryDAO, embeddingService);
        AccountService accountService = new AccountService(accountDAO, embeddingService);
        GoalService goalService = new GoalService(goalDAO, accountService, embeddingService);
        ChatService chatService = new ChatService(chatDAO);
        MessageService messageService = new MessageService(messageDAO, chatDAO);
        UserService userService = new UserService(userDAO, chatService, messageService);
        ItemService itemService = new ItemService(itemDAO, accountDAO, embeddingService);

        // Serviços de autenticação
        FirebaseAuthService firebaseAuthService = new FirebaseAuthService();
        SessionService sessionService = new SessionService();
        AuthMiddleware authMiddleware = new AuthMiddleware(sessionService);

        CategoryController categoryController = new CategoryController(categoryService);
        AccountController accountController = new AccountController(accountService);
        UserController userController = new UserController(userService);
        ItemController itemController = new ItemController(itemService);
        AuthController authController = new AuthController(firebaseAuthService, userService, sessionService);
        ChatController chatController = new ChatController(chatService);
        MessageController messageController = new MessageController(messageService);
        GoalController goalController = new GoalController(goalService);


        CategoryRoutes categoryRoutes = new CategoryRoutes(categoryController);
        AccountRoutes accountRoutes = new AccountRoutes(accountController);
        UserRoutes userRoutes = new UserRoutes(userController);
        ItemRoutes itemRoutes = new ItemRoutes(itemController);
        AuthRoutes authRoutes = new AuthRoutes(authController);
        ChatRoutes chatRoutes = new ChatRoutes(chatController);
        MessageRoutes messageRoutes = new MessageRoutes(messageController);
        GoalRoutes goalRoutes = new GoalRoutes(goalController);
        HealthRoutes healthRoutes = new HealthRoutes();

        registerAuthGuards(authMiddleware);
        
        categoryRoutes.register();
        accountRoutes.register();
        userRoutes.register();
        itemRoutes.register();
        authRoutes.register();
        chatRoutes.register();
        messageRoutes.register();
        goalRoutes.register();
        healthRoutes.register();
    }

    private static void registerAuthGuards(AuthMiddleware authMiddleware) {
        before("/categories", (req, res) -> {
            if (isPreflight(req)) return;
            authMiddleware.requireValidSession(req, res);
        });
        before("/categories/*", (req, res) -> {
            if (isPreflight(req)) return;
            authMiddleware.requireValidSession(req, res);
        });

        before("/accounts", (req, res) -> {
            if (isPreflight(req)) return;
            authMiddleware.requireValidSession(req, res);
        });
        before("/accounts/*", (req, res) -> {
            if (isPreflight(req)) return;
            authMiddleware.requireValidSession(req, res);
        });

        before("/items", (req, res) -> {
            if (isPreflight(req)) return;
            authMiddleware.requireValidSession(req, res);
        });
        before("/items/*", (req, res) -> {
            if (isPreflight(req)) return;
            authMiddleware.requireValidSession(req, res);
        });
        before("/goals", (req, res) -> {
            if (isPreflight(req)) return;
            authMiddleware.requireValidSession(req, res);
        });
        before("/goals/*", (req, res) -> {
            if (isPreflight(req)) return;
            authMiddleware.requireValidSession(req, res);
        });

        before("/chats", (req, res) -> {
            if (isPreflight(req)) return;
            authMiddleware.requireValidSession(req, res);
        });
        before("/chats/*", (req, res) -> {
            if (isPreflight(req)) return;
            authMiddleware.requireValidSession(req, res);
        });

        before("/users", (req, res) -> {
            if (isPreflight(req)) return;
            if ("POST".equalsIgnoreCase(req.requestMethod())) {
                authMiddleware.requireValidSession(req, res);
            }
        });
        before("/users/:id", (req, res) -> {
            if (isPreflight(req)) return;
            String method = req.requestMethod();
            if ("PUT".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method)) {
                authMiddleware.requireValidSession(req, res);
            }
        });
    }

    private static boolean isPreflight(Request req) {
        return "OPTIONS".equalsIgnoreCase(req.requestMethod());
    }
}
