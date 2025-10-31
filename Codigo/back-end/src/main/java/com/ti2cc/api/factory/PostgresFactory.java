package com.ti2cc.api.factory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class PostgresFactory {
    public static Connection getConnection() {
        try {

            String url = "jdbc:postgresql://db.ewyqqxoqofphrhjwehim.supabase.co:5432/postgres";
            String user = "postgres";
            String password = "n64n5o4n5lj4n6ij4";

            return DriverManager.getConnection(url, user, password);
        } catch (SQLException e) {
            throw new RuntimeException("Fail to establish a connection with postgres DB: ", e);
        }
    }
}
