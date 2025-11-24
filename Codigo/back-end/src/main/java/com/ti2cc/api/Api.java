package com.ti2cc.api;

import com.google.gson.Gson;
import com.ti2cc.api.container.Container;
import com.ti2cc.api.controller.UserController;
import com.ti2cc.api.dao.UserDAO;
import com.ti2cc.api.factory.PostgresFactory;
import com.ti2cc.api.model.User;

import java.sql.Connection;

import static spark.Spark.*;
import static spark.Spark.before;
import static spark.Spark.options;
import static spark.Spark.port;

public class Api {
    public static void main(String[] args) {
        port(8080);

        // Configuração CORS
        options("/*", (request, response) -> {
            String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null) {
                response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            }

            String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null) {
                response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
            }

            return "OK";
        });

        before((request, response) -> {
            response.header("Access-Control-Allow-Origin", "http://localhost:3000");
            response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
            response.header("Access-Control-Allow-Credentials", "true");
        });

        Container.register();
    }
}
