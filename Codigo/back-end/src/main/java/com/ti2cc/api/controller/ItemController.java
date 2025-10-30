package com.ti2cc.api.controller;

import java.time.LocalDate;
import java.util.UUID;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonSerializer;
import com.ti2cc.api.model.Item;
import com.ti2cc.api.service.ItemService;

public class ItemController {

    private final ItemService itemService;
    private final Gson gson;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
        
        this.gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, 
                    (JsonDeserializer<LocalDate>) (json, type, context) -> {
                        String dateStr = json.getAsString();
                        if (dateStr.contains("T")) {
                            return LocalDate.parse(dateStr.substring(0, 10));
                        } else {
                            return LocalDate.parse(dateStr);
                        }
                    })
                .registerTypeAdapter(LocalDate.class,
                    (JsonSerializer<LocalDate>) (date, type, context) ->
                        context.serialize(date.toString()))
                .create();
    }

    public String create(String body) {
        try {
            Item item = gson.fromJson(body, Item.class);
            boolean created = itemService.createItem(item);

            if (created) {
                return gson.toJson(item);
            } else {
                return gson.toJson("Failed to create item.");
            }
        } catch (com.google.gson.JsonSyntaxException e) {
            return gson.toJson("Invalid JSON format: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid request body: " + e.getMessage());
        }
    }

    public String getAll() {
        return gson.toJson(itemService.listAllItems());
    }

    public String getById(String idStr) {
        try {
            UUID id = UUID.fromString(idStr);
            Item item = itemService.findItemById(id);

            if (item != null) {
                return gson.toJson(item);
            } else {
                return gson.toJson("Item not found.");
            }
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid UUID format.");
        }
    }

    public String getByOwnerId(String ownerIdStr) {
        try {
            UUID ownerId = UUID.fromString(ownerIdStr);
            return gson.toJson(itemService.listItemsByOwnerId(ownerId));
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid owner UUID format.");
        }
    }

    public String getByCategoryId(String categoryIdStr) {
        try {
            UUID categoryId = UUID.fromString(categoryIdStr);
            return gson.toJson(itemService.listItemsByCategoryId(categoryId));
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid category UUID format.");
        }
    }

    public String update(String idStr, String body) {
        try {
            UUID id = UUID.fromString(idStr);
            Item item = gson.fromJson(body, Item.class);
            item.setId(id);

            boolean updated = itemService.updateItem(item);
            if (updated) {
                return gson.toJson("Item updated successfully.");
            } else {
                return gson.toJson("Failed to update item.");
            }
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid UUID format.");
        } catch (com.google.gson.JsonSyntaxException e) {
            return gson.toJson("Invalid JSON format: " + e.getMessage());
        }
    }

    public String delete(String idStr) {
        try {
            UUID id = UUID.fromString(idStr);
            boolean deleted = itemService.deleteItem(id);

            if (deleted) {
                return gson.toJson("Item deleted successfully.");
            } else {
                return gson.toJson("Item not found.");
            }
        } catch (IllegalArgumentException e) {
            return gson.toJson("Invalid UUID format.");
        }
    }
}
