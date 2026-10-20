/**
 * Generates the embeddings that are missing from accounts, categories, items and goals.
 *
 * When the OpenAI embeddings call fails, the API still saves the record, just without
 * `search_embedding`, so semantic search ranks it last. This script finds those rows
 * and fills them in with the same text the API embeds. Safe to re-run: it only
 * touches rows whose embedding is still NULL. From Codigo/back-end:
 *
 *   DB_URL='postgresql://...' bun database/backfill-embeddings.ts --dry-run
 *   DB_URL='postgresql://...' bun database/backfill-embeddings.ts
 */
import { SQL } from "bun";

const EMBEDDING_MODEL = "text-embedding-3-small";
// Rows per embeddings request; well under the API's input limit.
const BATCH_SIZE = 100;

const dryRun = process.argv.includes("--dry-run");

if (!process.env.DB_URL || (!dryRun && !process.env.OPENAI_API_KEY)) {
  console.error("DB_URL must be set, and OPENAI_API_KEY too unless --dry-run is given.");
  process.exit(1);
}

// Same composition as the services' buildSearchText / buildSearchTerm.
const join = (...parts: (string | null)[]) => parts.filter((p) => p && p.trim()).map((p) => p!.trim()).join(" ");

const embed = async (texts: string[]): Promise<string[]> => {
  const response = await fetch(process.env.OPENAI_API_URL || "https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts }),
  });
  if (!response.ok) throw new Error(`Embedding request failed: ${response.status} ${await response.text()}`);
  const body = (await response.json()) as { data: { index: number; embedding: number[] }[] };
  return body.data.sort((a, b) => a.index - b.index).map((d) => `[${d.embedding.join(",")}]`);
};

type Row = { id: string; text: string };

const sql = new SQL(process.env.DB_URL);

// A record edited meanwhile already got a fresher embedding from the API, hence IS NULL again.
const tables: {
  name: string;
  missing: () => Promise<Row[]>;
  update: (tx: SQL, id: string, vector: string) => Promise<unknown>;
}[] = [
  {
    name: "accounts",
    missing: async () =>
      (await sql`SELECT id, name, financial_institution FROM accounts WHERE search_embedding IS NULL`).map(
        (r: { id: string; name: string; financial_institution: string }) => ({ id: r.id, text: join(r.name, r.financial_institution) }),
      ),
    update: (tx, id, vector) =>
      tx`UPDATE accounts SET search_embedding = ${vector}::vector WHERE id = ${id} AND search_embedding IS NULL`,
  },
  {
    name: "categories",
    missing: async () =>
      (await sql`SELECT id, name FROM categories WHERE search_embedding IS NULL`).map((r: { id: string; name: string }) => ({
        id: r.id,
        text: join(r.name),
      })),
    update: (tx, id, vector) =>
      tx`UPDATE categories SET search_embedding = ${vector}::vector WHERE id = ${id} AND search_embedding IS NULL`,
  },
  {
    name: "items",
    missing: async () =>
      (await sql`SELECT id, name, description FROM items WHERE search_embedding IS NULL`).map(
        (r: { id: string; name: string; description: string }) => ({ id: r.id, text: join(r.name, r.description) }),
      ),
    update: (tx, id, vector) =>
      tx`UPDATE items SET search_embedding = ${vector}::vector WHERE id = ${id} AND search_embedding IS NULL`,
  },
  {
    name: "goals",
    missing: async () =>
      (await sql`SELECT id, title, description FROM goals WHERE search_embedding IS NULL`).map(
        (r: { id: string; title: string; description: string }) => ({ id: r.id, text: join(r.title, r.description) }),
      ),
    update: (tx, id, vector) =>
      tx`UPDATE goals SET search_embedding = ${vector}::vector WHERE id = ${id} AND search_embedding IS NULL`,
  },
];

let total = 0;
for (const table of tables) {
  // Rows with no text to embed stay NULL, like the API would leave them.
  const rows = (await table.missing()).filter((r) => r.text);
  console.log(`${table.name}: ${rows.length} without embedding`);
  if (dryRun || rows.length === 0) continue;

  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const batch = rows.slice(start, start + BATCH_SIZE);
    const vectors = await embed(batch.map((r) => r.text));
    await sql.begin(async (tx) => {
      for (let i = 0; i < batch.length; i++) {
        await table.update(tx, batch[i].id, vectors[i]);
      }
    });
    total += batch.length;
    console.log(`  ${Math.min(start + BATCH_SIZE, rows.length)}/${rows.length}`);
  }
}

console.log(dryRun ? "Dry run: nothing was written." : `Done: ${total} embeddings generated.`);
await sql.close();
