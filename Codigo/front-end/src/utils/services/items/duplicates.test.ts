import { afterEach, describe, expect, test } from "bun:test";
import { checkItemDuplicates, createItem } from "./index";
import type { CreateItemType } from "@/types/item.type";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const item: CreateItemType = {
  userId: "user", accountId: "account", categoryId: "category",
  name: "Faxineira", description: "Pagamento da faxineira",
  amount: 150, date: "2026-10-29", type: "expense",
};

describe("duplicate check transport", () => {
  test("sends the full batch to the authenticated backend endpoint", async () => {
    let endpoint = "";
    let headers: HeadersInit | undefined;
    let body: unknown;
    globalThis.fetch = async (input, init) => {
      endpoint = String(input);
      headers = init?.headers;
      body = JSON.parse(String(init?.body));
      return Response.json([[], [{ source: "batch", batchIndex: 0, item: null }]]);
    };
    const result = await checkItemDuplicates("session", [item, item]);
    expect(endpoint).toContain("items/duplicates");
    expect(new Headers(headers).get("X-Session-Id")).toBe("session");
    expect(body).toEqual([
      expect.objectContaining({ name: "Faxineira", amount: 150 }),
      expect.objectContaining({ name: "Faxineira", amount: 150 }),
    ]);
    expect(result).toEqual([[], [{ source: "batch", batchIndex: 0, item: null }]]);
  });

  test("only sends explicit confirmation when the user chooses it", async () => {
    const bodies: unknown[] = [];
    globalThis.fetch = async (input, init) => {
      bodies.push(JSON.parse(String(init?.body)));
      return Response.json({ ...item, id: "saved" });
    };
    await createItem("session", item);
    await createItem("session", { ...item, duplicateConfirmed: true });
    expect(bodies[0]).not.toHaveProperty("duplicateConfirmed");
    expect(bodies[1]).toEqual(expect.objectContaining({ duplicateConfirmed: true }));
  });
});
