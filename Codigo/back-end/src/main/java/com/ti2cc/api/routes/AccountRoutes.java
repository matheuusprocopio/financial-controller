package com.ti2cc.api.routes;

import com.ti2cc.api.controller.AccountController;

import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.path;
import static spark.Spark.post;
import static spark.Spark.put;

public class AccountRoutes {

    private final AccountController controller;

    public AccountRoutes(AccountController controller) {
        this.controller = controller;
    }

    public void register() {
        path("/accounts", () -> {
            post("", controller::create);
            get("", controller::listByUser);
            get("/:accountId", controller::getById);
            put("/:accountId", controller::update);
            delete("/:accountId", controller::delete);
        });
    }
}
