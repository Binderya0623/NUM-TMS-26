package com.tms.thesissystem.application.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@Service
public class DatabaseStatusService {
    private final String host;
    private final int port;
    private final String name;
    private final String username;
    private final String password;
    private final String url;

    public DatabaseStatusService(@Value("${app.database.host}") String host,
                                 @Value("${app.database.port}") int port,
                                 @Value("${app.database.name}") String name,
                                 @Value("${app.database.username}") String username,
                                 @Value("${app.database.password}") String password,
                                 @Value("${app.database.url}") String url) {
        this.host = host;
        this.port = port;
        this.name = name;
        this.username = username;
        this.password = password;
        this.url = url;
    }

    public DatabaseStatus check() {
        try (Connection connection = DriverManager.getConnection(url, username, password);
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery("select current_database(), current_user")) {
            if (resultSet.next()) {
                return new DatabaseStatus(
                        true,
                        host,
                        port,
                        name,
                        username,
                        url,
                        resultSet.getString(1),
                        resultSet.getString(2),
                        "Connection successful"
                );
            }
            return new DatabaseStatus(true, host, port, name, username, url, name, username, "Connection opened");
        } catch (Exception exception) {
            return new DatabaseStatus(
                    false,
                    host,
                    port,
                    name,
                    username,
                    url,
                    null,
                    null,
                    exception.getMessage()
            );
        }
    }

    public record DatabaseStatus(
            boolean connected,
            String host,
            int port,
            String database,
            String username,
            String url,
            String resolvedDatabase,
            String resolvedUser,
            String message
    ) {
    }
}
