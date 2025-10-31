package com.ti2cc.api.routes;

import com.ti2cc.api.controller.AccountController;

import static spark.Spark.*;

public class AccountRoutes {

    private final AccountController controller;

    public AccountRoutes(AccountController controller) {
        this.controller = controller;
    }

    public void register() {
        path("/accounts", () -> {
            post("", controller::create);
            get("", controller::listByUser);
            get("/:account_id", controller::getById);
            delete("/:account_id", controller::delete);
        });
    }
}
