package com.ti2cc.api;

import com.google.gson.Gson;
import com.ti2cc.api.container.Container;
import com.ti2cc.api.controller.UserController;
import com.ti2cc.api.dao.UserDAO;
import com.ti2cc.api.factory.PostgresFactory;
import com.ti2cc.api.model.User;

import java.sql.Connection;

import static spark.Spark.*;

public class Api {
    public static void main(String[] args) {
        port(8080);

        Container.register();
    }
}
