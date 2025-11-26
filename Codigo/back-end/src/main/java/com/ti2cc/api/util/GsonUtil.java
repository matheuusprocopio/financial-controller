package com.ti2cc.api.util;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonSerializer;

public class GsonUtil {

    private static final Gson GSON = new GsonBuilder()
            .registerTypeAdapter(OffsetDateTime.class,
                    (JsonSerializer<OffsetDateTime>) (value, type, context) ->
                            context.serialize(value != null ? value.toString() : null))
            .registerTypeAdapter(OffsetDateTime.class,
                    (JsonDeserializer<OffsetDateTime>) (json, type, context) ->
                            (json == null || json.isJsonNull())
                                    ? null
                                    : OffsetDateTime.parse(json.getAsString()))
            .registerTypeAdapter(LocalDate.class,
                    (JsonSerializer<LocalDate>) (value, type, context) ->
                            context.serialize(value != null ? value.toString() : null))
            .registerTypeAdapter(LocalDate.class,
                    (JsonDeserializer<LocalDate>) (json, type, context) -> {
                            if (json == null || json.isJsonNull()) {
                                return null;
                            }
                            String dateStr = json.getAsString();
                            if (dateStr.contains("T")) {
                                return LocalDate.parse(dateStr.substring(0, 10));
                            }
                            return LocalDate.parse(dateStr);
                    })
            .create();

    private GsonUtil() {
    }

    public static Gson getGson() {
        return GSON;
    }
}
