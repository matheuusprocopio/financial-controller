package com.ti2cc.api.service;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.ti2cc.api.dao.AccountDAO;
import com.ti2cc.api.dao.ItemDAO;
import com.ti2cc.api.model.Item;
import com.ti2cc.api.model.Item.ItemType;

class ItemDuplicateMatcherTest {
    private final UUID user = UUID.randomUUID();
    private final UUID account = UUID.randomUUID();

    private Item item(String name, String description) {
        Item item = new Item();
        item.setUserId(user);
        item.setAccountId(account);
        item.setCategoryId(UUID.randomUUID());
        item.setDate(LocalDate.of(2026, 10, 29));
        item.setAmount(150.0);
        item.setType(ItemType.expense);
        item.setName(name);
        item.setDescription(description);
        return item;
    }

    @Test void detectsRepeatedTransactionAndSemanticParaphrase() {
        Item original = item("Faxineira", "Pagamento da faxineira");
        Item repeated = item("Faxineira", "Pagamento da faxineira");
        assertTrue(ItemDuplicateMatcher.matches(repeated, original));
        repeated.setName("Limpeza");
        repeated.setDescription("Serviço doméstico");
        repeated.setSearchEmbedding(new float[] {1, 0});
        original.setSearchEmbedding(new float[] {0.99f, 0.01f});
        assertTrue(ItemDuplicateMatcher.matches(repeated, original));
    }

    @Test void keepsLegitimateSimilarTransactionsSeparate() {
        Item original = item("Faxineira", "Pagamento da faxineira");
        Item other = item("Faxineira", "Pagamento da faxineira");
        other.setAccountId(UUID.randomUUID());
        assertFalse(ItemDuplicateMatcher.matches(other, original));
        other.setAccountId(account);
        other.setDate(original.getDate().plusDays(1));
        assertFalse(ItemDuplicateMatcher.matches(other, original));
        other.setDate(original.getDate());
        other.setDescription("Compra de material de limpeza");
        other.setName("Material");
        assertFalse(ItemDuplicateMatcher.matches(other, original));
    }

    @Test void requiresExplicitConfirmationAtPersistence() {
        Item existing = item("Faxineira", "Pagamento da faxineira");
        class FakeDao extends ItemDAO {
            int saved;
            FakeDao() { super(null); }
            @Override public List<Item> findDuplicateCandidates(Item item) { return List.of(existing); }
            @Override public boolean create(Item item) { saved++; return true; }
        }
        FakeDao dao = new FakeDao();
        EmbeddingService embeddings = new EmbeddingService() {
            @Override public float[] generateEmbedding(String text) { return null; }
        };
        ItemService service = new ItemService(dao, new AccountDAO(null) {
            @Override public boolean decreaseBalance(UUID id, double amount) { return true; }
        }, embeddings);
        assertThrows(ItemService.PossibleDuplicateException.class,
                () -> service.createItem(item("Faxineira", "Pagamento da faxineira")));
        assertEquals(0, dao.saved);
        assertTrue(service.createItem(item("Faxineira", "Pagamento da faxineira"), true));
        assertEquals(1, dao.saved);
    }

    @Test void detectsEarlierDuplicateWithinBatch() {
        ItemService service = new ItemService(null, null, new EmbeddingService() {
            @Override public float[] generateEmbedding(String text) {
                return text.contains("Restaurante") ? new float[] {0, 1} : new float[] {1, 0};
            }
        });
        Item first = item("Faxineira", "Pagamento da faxineira");
        Item second = item("Faxineira", "Pagamento da faxineira");
        Item different = item("Almoço", "Restaurante");
        assertEquals(List.of(0), service.findEarlierBatchDuplicates(List.of(first, different, second), 2));
        Item paraphrase = item("Limpeza", "Serviço doméstico");
        assertEquals(List.of(0), service.findEarlierBatchDuplicates(List.of(first, paraphrase), 1));
    }
}
