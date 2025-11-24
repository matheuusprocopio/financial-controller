package com.ti2cc.api.container;

import java.sql.Connection;

import com.ti2cc.api.controller.AccountController;
import com.ti2cc.api.controller.CategoryController;
import com.ti2cc.api.controller.ChatController;
import com.ti2cc.api.controller.ItemController;
import com.ti2cc.api.controller.MessageController;
import com.ti2cc.api.controller.UserController;
import com.ti2cc.api.dao.AccountDAO;
import com.ti2cc.api.dao.CategoryDAO;
import com.ti2cc.api.dao.ChatDAO;
import com.ti2cc.api.dao.ItemDAO;
import com.ti2cc.api.dao.MessageDAO;
import com.ti2cc.api.dao.UserDAO;
import com.ti2cc.api.factory.PostgresFactory;
import com.ti2cc.api.routes.AccountRoutes;
import com.ti2cc.api.routes.CategoryRoutes;
import com.ti2cc.api.routes.ChatRoutes;
import com.ti2cc.api.routes.ItemRoutes;
import com.ti2cc.api.routes.MessageRoutes;
import com.ti2cc.api.routes.UserRoutes;
import com.ti2cc.api.service.AccountService;
import com.ti2cc.api.service.CategoryService;
import com.ti2cc.api.service.ChatService;
import com.ti2cc.api.service.ItemService;
import com.ti2cc.api.service.MessageService;
import com.ti2cc.api.service.UserService;

public class Container {
    public static void register() {
        Connection postgresConn = PostgresFactory.getConnection();

        CategoryDAO categoryDAO = new CategoryDAO(postgresConn);
        AccountDAO accountDAO = new AccountDAO(postgresConn);
        UserDAO userDAO = new UserDAO(postgresConn);
        ItemDAO itemDAO = new ItemDAO(postgresConn);
        ChatDAO chatDAO = new ChatDAO(postgresConn);
        MessageDAO messageDAO = new MessageDAO(postgresConn);


        CategoryService categoryService = new CategoryService(categoryDAO);
        AccountService accountService = new AccountService(accountDAO);
        UserService userService = new UserService(userDAO);
        ItemService itemService = new ItemService(itemDAO, accountDAO);
        ChatService chatService = new ChatService(chatDAO);
        MessageService messageService = new MessageService(messageDAO, chatDAO);


        CategoryController categoryController = new CategoryController(categoryService);
        AccountController accountController = new AccountController(accountService);
        UserController userController = new UserController(userService);
        ItemController itemController = new ItemController(itemService);
        ChatController chatController = new ChatController(chatService);
        MessageController messageController = new MessageController(messageService);


        CategoryRoutes categoryRoutes = new CategoryRoutes(categoryController);
        AccountRoutes accountRoutes = new AccountRoutes(accountController);
        UserRoutes userRoutes = new UserRoutes(userController);
        ItemRoutes itemRoutes = new ItemRoutes(itemController);
        ChatRoutes chatRoutes = new ChatRoutes(chatController);
        MessageRoutes messageRoutes = new MessageRoutes(messageController);


        categoryRoutes.register();
        accountRoutes.register();
        userRoutes.register();
        itemRoutes.register();
        chatRoutes.register();
        messageRoutes.register();
    }
}
