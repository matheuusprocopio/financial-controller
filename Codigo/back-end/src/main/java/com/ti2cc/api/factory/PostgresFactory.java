package com.ti2cc.api.factory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class PostgresFactory {
    public static Connection getConnection() {
        try {

            String url = "jdbc:postgresql://localhost:5432/financial_controller";
            String user = "admin";
            String password = "admin123";

            return DriverManager.getConnection(url, user, password);
        } catch (SQLException e) {
            throw new RuntimeException("Fail to establish a connection with postgres DB: ", e);
        }
    }
}
