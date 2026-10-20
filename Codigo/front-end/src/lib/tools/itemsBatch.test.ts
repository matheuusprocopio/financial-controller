import { describe, expect, test } from "bun:test";

import { getLocalIsoDate } from "@/utils/date";
import { categorySearchTerm, resolveBatchRow, type BatchItemInput } from "./itemsBatch";

const base: BatchItemInput = {
  name: "Uber",
  description: "Uber para o trabalho",
  amount: 38,
  type: "expense",
  date: "2026-10-19",
};

const categories = [
  { id: "c-transporte", name: "Transporte" },
  { id: "c-alimentacao", name: "Alimentação" },
];
const accounts = [
  { id: "a-nubank", name: "Nubank" },
  { id: "a-itau", name: "Itaú" },
];

describe("resolveBatchRow", () => {
  test("uses the category whose name matches the suggestion", () => {
    const row = resolveBatchRow({ ...base, suggestedCategoryName: "Alimentação" }, categories, accounts);
    expect(row.categoryId).toBe("c-alimentacao");
    expect(row.needsCategorySelection).toBe(false);
  });

  test("falls back to the nearest candidate and flags it when no name matches", () => {
    const row = resolveBatchRow({ ...base, suggestedCategoryName: "Mobilidade urbana" }, categories, accounts);
    expect(row.categoryId).toBe("c-transporte");
    expect(row.needsCategorySelection).toBe(true);
  });

  test("flags the category when the user has none", () => {
    const row = resolveBatchRow({ ...base, suggestedCategoryName: "Transporte" }, [], accounts);
    expect(row.categoryId).toBe("");
    expect(row.needsCategorySelection).toBe(true);
  });

  test("resolves an account the user named", () => {
    const row = resolveBatchRow({ ...base, suggestedAccountName: "itau" }, categories, accounts);
    expect(row.accountId).toBe("a-itau");
    expect(row.needsAccountSelection).toBe(false);
  });

  test("defaults to the first account without flagging when none was named", () => {
    const row = resolveBatchRow(base, categories, accounts);
    expect(row.accountId).toBe("a-nubank");
    expect(row.needsAccountSelection).toBe(false);
  });

  test("flags an account the user named but that does not exist", () => {
    const row = resolveBatchRow({ ...base, suggestedAccountName: "Bradesco" }, categories, accounts);
    expect(row.accountId).toBe("a-nubank");
    expect(row.needsAccountSelection).toBe(true);
  });

  test("normalizes the date and defaults to today", () => {
    expect(resolveBatchRow({ ...base, date: "2026-10-19T12:00:00Z" }, categories, accounts).date).toBe("2026-10-19");
    expect(resolveBatchRow({ ...base, date: "" }, categories, accounts).date).toBe(getLocalIsoDate());
  });
});

describe("categorySearchTerm", () => {
  test("prefers the suggested category, then the name", () => {
    expect(categorySearchTerm({ ...base, suggestedCategoryName: "Transporte" })).toBe("Transporte");
    expect(categorySearchTerm(base)).toBe("Uber");
  });
});
