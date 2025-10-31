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

        // Configuração de CORS
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
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-Id");
            response.header("Access-Control-Allow-Credentials", "true");
        });

        // Registra todas as rotas
        Container.register();

        // Tratamento de erros
        exception(Exception.class, (exception, request, response) -> {
            exception.printStackTrace();
            response.status(500);
            response.type("application/json");
            response.body("{\"error\":\"Erro interno do servidor\"}");
        });
    }
}
