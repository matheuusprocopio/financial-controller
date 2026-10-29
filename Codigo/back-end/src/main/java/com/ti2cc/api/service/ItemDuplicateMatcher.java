package com.ti2cc.api.service;

import java.text.Normalizer;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import com.ti2cc.api.model.Item;

public final class ItemDuplicateMatcher {
    private ItemDuplicateMatcher() {}

    public static boolean matches(Item incoming, Item existing) {
        if (!sameFacts(incoming, existing)) return false;

        String left = normalize(text(incoming));
        String right = normalize(text(existing));
        if (left.isBlank() || right.isBlank()) return false;
        if (left.equals(right)) return true;
        Set<String> a = new HashSet<>(Arrays.asList(left.split(" ")));
        Set<String> b = new HashSet<>(Arrays.asList(right.split(" ")));
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        double overlap = (double) intersection.size() / Math.max(a.size(), b.size());
        if (overlap >= 0.8) return true;
        return cosine(incoming.getSearchEmbedding(), existing.getSearchEmbedding()) >= 0.97;
    }

    public static boolean sameFacts(Item incoming, Item existing) {
        if (incoming == null || existing == null || incoming.getUserId() == null
                || !incoming.getUserId().equals(existing.getUserId())
                || incoming.getAccountId() == null || !incoming.getAccountId().equals(existing.getAccountId())
                || incoming.getDate() == null || !incoming.getDate().equals(existing.getDate())
                || incoming.getType() != existing.getType()
                || incoming.getAmount() == null || existing.getAmount() == null
                || !money(incoming.getAmount()).equals(money(existing.getAmount()))) return false;
        return true;
    }

    private static BigDecimal money(Double amount) {
        return BigDecimal.valueOf(amount).setScale(2, RoundingMode.HALF_UP);
    }

    private static String normalize(String value) {
        return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase().replaceAll("[^a-z0-9]+", " ").trim();
    }

    private static String text(Item item) {
        return (item.getName() == null ? "" : item.getName()) + " "
                + (item.getDescription() == null ? "" : item.getDescription());
    }

    private static double cosine(float[] a, float[] b) {
        if (a == null || b == null || a.length != b.length) return 0;
        double dot = 0, aa = 0, bb = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i];
        }
        return aa == 0 || bb == 0 ? 0 : dot / Math.sqrt(aa * bb);
    }
}
