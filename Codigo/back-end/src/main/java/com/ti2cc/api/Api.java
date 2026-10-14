package com.ti2cc.api;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import com.ti2cc.api.container.Container;

import io.github.cdimascio.dotenv.Dotenv;

import static spark.Spark.before;
import static spark.Spark.options;
import static spark.Spark.port;
import static spark.Spark.stop;



public class Api {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMissing()
                .load();

        // Plataformas como o Render informam a porta pela variável PORT
        String portEnv = dotenv.get("PORT");
        port(portEnv != null && !portEnv.isBlank() ? Integer.parseInt(portEnv.trim()) : 8080);

        // Origens liberadas no CORS, separadas por vírgula (ex.: https://meu-app.vercel.app)
        String originsEnv = dotenv.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000");
        Set<String> allowedOrigins = Arrays.stream(originsEnv.split(","))
                .map(String::trim)
                .map(origin -> origin.endsWith("/") ? origin.substring(0, origin.length() - 1) : origin)
                .filter(origin -> !origin.isEmpty())
                .collect(Collectors.toSet());

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
            // Só reflete o Origin se ele estiver na lista de origens permitidas
            if (origin != null && allowedOrigins.contains(origin)) {
                response.header("Access-Control-Allow-Origin", origin);
                response.header("Access-Control-Allow-Credentials", "true");
                response.header("Vary", "Origin");
            }
            response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Session-Id");
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
