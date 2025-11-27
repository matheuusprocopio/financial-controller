package com.ti2cc.api.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import io.github.cdimascio.dotenv.Dotenv;

public class EmbeddingService {
    private static final String DEFAULT_MODEL = "text-embedding-3-small";
    private static final String DEFAULT_URL = "https://api.openai.com/v1/embeddings";

    private final HttpClient httpClient;
    private final Gson gson;
    private final String apiKey;
    private final String apiUrl;

    public EmbeddingService() {
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMissing()
                .load();

        this.httpClient = HttpClient.newHttpClient();
        this.gson = new Gson();
        this.apiKey = dotenv.get("OPENAI_API_KEY");

        String configuredUrl = dotenv.get("OPENAI_API_URL");
        this.apiUrl = configuredUrl != null && !configuredUrl.isBlank() ? configuredUrl : DEFAULT_URL;
    }

    public float[] generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }

        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("OPENAI_API_KEY is not configured.");
            return null;
        }

        try {
            JsonObject body = new JsonObject();
            body.addProperty("model", DEFAULT_MODEL);
            body.addProperty("input", text);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                System.err.println("Failed to generate embedding. Status: " + response.statusCode() + " Body: " + response.body());
                return null;
            }

            JsonObject responseJson = gson.fromJson(response.body(), JsonObject.class);
            JsonArray dataArray = responseJson.getAsJsonArray("data");
            if (dataArray == null || dataArray.size() == 0) {
                System.err.println("Embedding response does not contain data.");
                return null;
            }

            JsonArray embeddingArray = dataArray.get(0).getAsJsonObject().getAsJsonArray("embedding");
            if (embeddingArray == null || embeddingArray.size() == 0) {
                return null;
            }

            float[] embedding = new float[embeddingArray.size()];
            for (int i = 0; i < embeddingArray.size(); i++) {
                embedding[i] = embeddingArray.get(i).getAsFloat();
            }

            return embedding;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("OpenAI embeddings request interrupted: " + e.getMessage());
            return null;
        } catch (IOException e) {
            System.err.println("Error while calling OpenAI embeddings API: " + e.getMessage());
            return null;
        } catch (Exception e) {
            System.err.println("Unexpected error while generating embedding: " + e.getMessage());
            return null;
        }
    }
}
