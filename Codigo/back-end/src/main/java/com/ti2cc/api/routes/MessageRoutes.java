package com.ti2cc.api.routes;

import com.ti2cc.api.controller.MessageController;

import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.patch;

public class MessageRoutes {

    private final MessageController controller;

    public MessageRoutes(MessageController controller) {
        this.controller = controller;
    }

    public void register() {
        post("/chats/:chatId/messages", controller::create);
        get("/chats/:chatId/messages", controller::list);
        patch("/chats/:chatId/messages/:messageId", controller::update);
    }
}
