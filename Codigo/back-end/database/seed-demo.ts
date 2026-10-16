/**
 * Fills an existing user with ~3 months of realistic data for demos.
 *
 * The user must sign up in the app first. Then, from Codigo/back-end:
 *
 *   DB_URL='postgresql://...' bun database/seed-demo.ts --email demo@example.com
 *   DB_URL='postgresql://...' bun database/seed-demo.ts --email demo@example.com --reset
 *
 * --reset deletes that user's accounts, categories, transactions and goals first.
 * Without it the script refuses to touch a user that already has transactions.
 *
 * Embeddings are generated in one batched request with the same text the API uses
 * (name + description), so semantic search works on the seeded data.
 */
import { SQL } from "bun";

const EMBEDDING_MODEL = "text-embedding-3-small";
const MONTHS_BACK = 3;
const TIME_ZONE = "America/Sao_Paulo";

const argv = process.argv.slice(2);
const email = argv[argv.indexOf("--email") + 1];
const reset = argv.includes("--reset");

if (!argv.includes("--email") || !email) {
  console.error("Usage: bun database/seed-demo.ts --email <user email> [--reset]");
  process.exit(1);
}
if (!process.env.DB_URL || !process.env.OPENAI_API_KEY) {
  console.error("DB_URL and OPENAI_API_KEY must be set.");
  process.exit(1);
}

// Deterministic pseudo-random numbers, so every run produces the same history.
let seed = 42;
const random = () => {
  seed = (seed * 1664525 + 1013904223) % 2 ** 32;
  return seed / 2 ** 32;
};
const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];
const between = (min: number, max: number) => Math.round((min + random() * (max - min)) * 100) / 100;

const today = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
const [ty, tm, td] = today.split("-").map(Number);
const iso = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);

type Account = { key: string; name: string; institution: string; balance: number };
type Category = { key: string; name: string };
type Item = {
  name: string;
  description: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  category: string;
  account: string;
};
type Goal = { title: string; description: string; target: number; current: number; deadline: string; account: string };

const accounts: Account[] = [
  { key: "nubank", name: "Conta Nubank", institution: "Nubank", balance: 4380.55 },
  { key: "itau", name: "Conta Corrente", institution: "Itaú", balance: 1250.0 },
  { key: "carteira", name: "Carteira", institution: "Dinheiro", balance: 180.0 },
];

const categories: Category[] = [
  { key: "alimentacao", name: "Alimentação" },
  { key: "mercado", name: "Mercado" },
  { key: "transporte", name: "Transporte" },
  { key: "moradia", name: "Moradia" },
  { key: "saude", name: "Saúde" },
  { key: "lazer", name: "Lazer" },
  { key: "assinaturas", name: "Assinaturas" },
  { key: "salario", name: "Salário" },
  { key: "freelance", name: "Freelance" },
];

// Recurring monthly entries: [day, name, description, amount, type, category, account]
const monthly: [number, string, string, number, Item["type"], string, string][] = [
  [5, "Salário", "Salário mensal", 4800, "income", "salario", "nubank"],
  [10, "Aluguel", "Aluguel do apartamento", 1500, "expense", "moradia", "itau"],
  [12, "Conta de luz", "Energia elétrica", 0, "expense", "moradia", "itau"],
  [15, "Internet", "Plano de internet fibra", 99.9, "expense", "moradia", "nubank"],
  [8, "Netflix", "Assinatura de streaming", 55.9, "expense", "assinaturas", "nubank"],
  [18, "Spotify", "Assinatura de música", 21.9, "expense", "assinaturas", "nubank"],
  [3, "Academia", "Mensalidade da academia", 120, "expense", "saude", "nubank"],
];

// Variable spending: [name, description, min, max, category, account, times per month]
const variable: [string, string, number, number, string, string, number][] = [
  ["Almoço", "Almoço perto do trabalho", 28, 55, "alimentacao", "nubank", 8],
  ["iFood", "Pedido de delivery", 35, 90, "alimentacao", "nubank", 4],
  ["Padaria", "Café e pão", 9, 25, "alimentacao", "carteira", 5],
  ["Supermercado", "Compras do mês no mercado", 180, 480, "mercado", "nubank", 3],
  ["Uber", "Corrida de Uber", 14, 42, "transporte", "nubank", 6],
  ["Gasolina", "Abastecimento do carro", 150, 260, "transporte", "itau", 2],
  ["Farmácia", "Remédios e higiene", 25, 110, "saude", "nubank", 1],
  ["Cinema", "Ingresso e pipoca", 45, 90, "lazer", "nubank", 1],
  ["Bar com amigos", "Happy hour", 60, 160, "lazer", "nubank", 2],
];

const items: Item[] = [];
for (let back = MONTHS_BACK - 1; back >= 0; back--) {
  const monthStart = new Date(Date.UTC(ty, tm - 1 - back, 1));
  const y = monthStart.getUTCFullYear();
  const m = monthStart.getUTCMonth() + 1;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  // The current month is only partly over: scale variable spending to the days elapsed.
  const lastDay = back === 0 ? td : daysInMonth;
  const share = lastDay / daysInMonth;

  for (const [day, name, description, amount, type, category, account] of monthly) {
    if (day > lastDay) continue;
    const value = amount || between(140, 230);
    items.push({ name, description, amount: value, date: iso(y, m, day), type, category, account });
  }
  for (const [name, description, min, max, category, account, times] of variable) {
    for (let i = 0; i < Math.round(times * share); i++) {
      const day = 1 + Math.floor(random() * lastDay);
      items.push({ name, description, amount: between(min, max), date: iso(y, m, day), type: "expense", category, account });
    }
  }
  if (random() > 0.3) {
    const day = 1 + Math.floor(random() * lastDay);
    items.push({
      name: "Freela",
      description: pick(["Site para cliente", "Ajuste em sistema", "Consultoria de dados"]),
      amount: between(600, 1500),
      date: iso(y, m, day),
      type: "income",
      category: "freelance",
      account: "nubank",
    });
  }
}

const goals: Goal[] = [
  { title: "Viagem de fim de ano", description: "Viagem para o Nordeste em dezembro", target: 6000, current: 2350, deadline: iso(ty, 12, 15), account: "nubank" },
  { title: "Reserva de emergência", description: "Seis meses de custo de vida", target: 20000, current: 7400, deadline: iso(ty + 1, 6, 30), account: "itau" },
  { title: "Notebook novo", description: "Notebook para estudar e programar", target: 5000, current: 5000, deadline: iso(ty, tm, 1), account: "nubank" },
];

const join = (...parts: string[]) => parts.filter((p) => p && p.trim()).join(" ").trim();

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

const sql = new SQL(process.env.DB_URL);

const [user] = await sql`SELECT id, name FROM users WHERE email = ${email}`;
if (!user) {
  console.error(`No user with email ${email}. Sign up in the app first.`);
  process.exit(1);
}

const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM items WHERE user_id = ${user.id}`;
if (count > 0 && !reset) {
  console.error(`User already has ${count} transactions. Re-run with --reset to replace them.`);
  process.exit(1);
}

const texts = [
  ...accounts.map((a) => join(a.name, a.institution)),
  ...categories.map((c) => c.name),
  ...items.map((i) => join(i.name, i.description)),
  ...goals.map((g) => join(g.title, g.description)),
];
console.log(`Generating ${texts.length} embeddings…`);
const vectors = await embed(texts);
let v = 0;

await sql.begin(async (tx) => {
  if (reset) {
    await tx`DELETE FROM items WHERE user_id = ${user.id}`;
    await tx`DELETE FROM goals WHERE user_id = ${user.id}`;
    await tx`DELETE FROM categories WHERE user_id = ${user.id}`;
    await tx`DELETE FROM accounts WHERE user_id = ${user.id}`;
  }

  const accountIds = new Map<string, string>();
  for (const a of accounts) {
    const id = crypto.randomUUID();
    accountIds.set(a.key, id);
    await tx`INSERT INTO accounts (id, user_id, name, financial_institution, balance, search_embedding)
             VALUES (${id}, ${user.id}, ${a.name}, ${a.institution}, ${a.balance}, ${vectors[v++]}::vector)`;
  }

  const categoryIds = new Map<string, string>();
  for (const c of categories) {
    const id = crypto.randomUUID();
    categoryIds.set(c.key, id);
    await tx`INSERT INTO categories (id, user_id, name, search_embedding)
             VALUES (${id}, ${user.id}, ${c.name}, ${vectors[v++]}::vector)`;
  }

  for (const i of items) {
    await tx`INSERT INTO items (id, user_id, category_id, account_id, name, description, amount, date, type, search_embedding)
             VALUES (${crypto.randomUUID()}, ${user.id}, ${categoryIds.get(i.category)}, ${accountIds.get(i.account)},
                     ${i.name}, ${i.description}, ${i.amount}, ${i.date}::date, ${i.type}::item_type, ${vectors[v++]}::vector)`;
  }

  for (const g of goals) {
    await tx`INSERT INTO goals (id, user_id, account_id, title, description, target_amount, current_amount, deadline, achieved, search_embedding)
             VALUES (${crypto.randomUUID()}, ${user.id}, ${accountIds.get(g.account)}, ${g.title}, ${g.description},
                     ${g.target}, ${g.current}, ${g.deadline}::date, ${g.current >= g.target}, ${vectors[v++]}::vector)`;
  }
});

const income = items.filter((i) => i.type === "income").reduce((s, i) => s + i.amount, 0);
const expense = items.filter((i) => i.type === "expense").reduce((s, i) => s + i.amount, 0);
console.log(
  `Seeded ${user.name ?? email}: ${accounts.length} accounts, ${categories.length} categories, ` +
    `${items.length} transactions (in R$ ${income.toFixed(2)} / out R$ ${expense.toFixed(2)}), ${goals.length} goals.`,
);
await sql.end();
