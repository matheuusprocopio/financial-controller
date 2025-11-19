package com.ti2cc.api.routes;

import com.ti2cc.api.controller.ChatController;

import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.path;
import static spark.Spark.post;
import static spark.Spark.put;

public class ChatRoutes {

    private final ChatController controller;

    public ChatRoutes(ChatController controller) {
        this.controller = controller;
    }

    public void register() {
        path("/chats", () -> {
            post("", controller::create);
            get("", controller::listByUser);
            get("/:chatId", controller::getById);
            put("/:chatId", controller::update);
            delete("/:chatId", controller::delete);
        });
    }
}
