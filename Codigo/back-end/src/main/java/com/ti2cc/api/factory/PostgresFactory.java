package com.ti2cc.api.factory;

import java.net.URI;
import java.net.URISyntaxException;

import javax.sql.DataSource;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import io.github.cdimascio.dotenv.Dotenv;

public class PostgresFactory {
    private static final Dotenv dotenv = Dotenv.configure()
            .directory("./")
            .ignoreIfMissing()
            .load();

    /**
     * Cria o pool de conexões. Cada operação pega uma conexão do pool e a devolve ao terminar;
     * conexões derrubadas pelo banco (ex.: Neon hibernando) são descartadas e recriadas.
     */
    public static DataSource createDataSource() {
        String rawUrl = dotenv.get("DB_URL");
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new RuntimeException("Database URL not found in environment variables");
        }

        DatabaseConfig fromUrl = parseDatabaseUrl(rawUrl);

        String resolvedUser = fromUrl.user != null ? fromUrl.user : dotenv.get("DB_USER");
        String resolvedPassword = fromUrl.password != null ? fromUrl.password : dotenv.get("DB_PASSWORD");

        if (resolvedUser == null || resolvedPassword == null) {
            throw new RuntimeException("Database credentials not found in environment variables or URL");
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(fromUrl.jdbcUrl);
        config.setUsername(resolvedUser);
        config.setPassword(resolvedPassword);
        config.setPoolName("financial-controller");
        config.setMaximumPoolSize(5);
        // Sem conexões ociosas mantidas abertas, o banco pode hibernar quando não há uso
        config.setMinimumIdle(0);
        config.setIdleTimeout(60_000);
        config.setConnectionTimeout(30_000);

        try {
            // Valida a conexão já na criação: falha na inicialização se o banco estiver inacessível
            return new HikariDataSource(config);
        } catch (RuntimeException e) {
            throw new RuntimeException("Fail to establish a connection with postgres DB: ", e);
        }
    }

    private static DatabaseConfig parseDatabaseUrl(String rawUrl) {
        try {
            URI uri = new URI(rawUrl);

            String scheme = uri.getScheme();
            if (scheme == null) {
                throw new RuntimeException("Database URL does not contain a scheme");
            }

            String jdbcUrl;
            if (scheme.startsWith("jdbc")) {
                jdbcUrl = rawUrl;
            } else if (scheme.equals("postgresql") || scheme.equals("postgres")) {
                StringBuilder builder = new StringBuilder("jdbc:postgresql://");
                String host = uri.getHost();
                if (host != null) {
                    if (host.contains(":")) {
                        builder.append("[").append(host).append("]");
                    } else {
                        builder.append(host);
                    }
                }
                if (uri.getPort() != -1) {
                    builder.append(":").append(uri.getPort());
                }
                if (uri.getPath() != null) {
                    builder.append(uri.getPath());
                }
                if (uri.getQuery() != null && !uri.getQuery().isEmpty()) {
                    builder.append("?").append(uri.getQuery());
                }
                jdbcUrl = builder.toString();
            } else {
                throw new RuntimeException("Unsupported database scheme: " + scheme);
            }

            String user = null;
            String password = null;
            String userInfo = uri.getUserInfo();
            if (userInfo != null) {
                String[] credentials = userInfo.split(":", 2);
                user = credentials[0];
                if (credentials.length > 1) {
                    password = credentials[1];
                }
            }

            return new DatabaseConfig(jdbcUrl, user, password);
        } catch (URISyntaxException e) {
            throw new RuntimeException("Invalid PostgreSQL URL format", e);
        }
    }

    private static final class DatabaseConfig {
        private final String jdbcUrl;
        private final String user;
        private final String password;

        private DatabaseConfig(String jdbcUrl, String user, String password) {
            this.jdbcUrl = jdbcUrl;
            this.user = user;
            this.password = password;
        }
    }
}
