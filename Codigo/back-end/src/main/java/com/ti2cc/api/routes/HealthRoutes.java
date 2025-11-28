package com.ti2cc.api.routes;

import static spark.Spark.get;

public class HealthRoutes {

    public void register() {
        get("/health", (request, response) -> {
            response.type("application/json");
            return "{\"status\":\"ok\"}";
        });
    }
}
