package com.ti2cc.api;

import com.ti2cc.api.container.Container;

import static spark.Spark.before;
import static spark.Spark.options;
import static spark.Spark.port;
import static spark.Spark.stop;



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
            String origin = request.headers("Origin");
            // Libera CORS para qualquer origem (reflete o Origin recebido)
            response.header("Access-Control-Allow-Origin", origin != null ? origin : "*");
            response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Session-Id");
            response.header("Access-Control-Allow-Credentials", "true");
        });

        try {
            Container.register();
        } catch (RuntimeException e) {
            // Sem isso o Jetty continua de pé sem nenhuma rota registrada (404 em tudo)
            System.err.println("Falha ao inicializar a API: " + e.getMessage());
            e.printStackTrace();
            stop();
            System.exit(1);
        }
    }
}
