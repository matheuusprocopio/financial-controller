package com.ti2cc.api.factory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import io.github.cdimascio.dotenv.Dotenv;

public class PostgresFactory {
    private static final Dotenv dotenv = Dotenv.configure()
            .directory("./")
            .ignoreIfMissing()
            .load();

    public static Connection getConnection() {
        try {
            String url = dotenv.get("DB_URL");
            String user = dotenv.get("DB_USER");
            String password = dotenv.get("DB_PASSWORD");

            if (url == null || user == null || password == null) {
                throw new RuntimeException("Database credentials not found in environment variables");
            }

            return DriverManager.getConnection(url, user, password);
        } catch (SQLException e) {
            throw new RuntimeException("Fail to establish a connection with postgres DB: ", e);
        }
    }
}
