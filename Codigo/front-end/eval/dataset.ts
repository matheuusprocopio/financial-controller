import type { DateHelpers } from "./dates";

/**
 * How a single tool argument is checked.
 * - eq: strict equality
 * - approx: numeric equality with a 0.01 tolerance
 * - has: normalized string (lowercase, no accents) contains any of the keywords
 * - date: value is one of the accepted ISO dates (`undefined` = argument omitted)
 * - includes: array argument contains the value
 * - startsWith: string argument starts with the prefix
 * - items: array argument has exactly these entries, in any order, each entry
 *   matching every check of one expected entry
 */
export type Check =
  | { eq: unknown }
  | { approx: number }
  | { has: string[] }
  | { date: (string | undefined)[] }
  | { includes: string }
  | { startsWith: string }
  | { items: Record<string, Check>[] };

export type Expectation =
  | { tool: string[]; args?: Record<string, Check> }
  | { noTool: true };

export type EvalCase = {
  id: string;
  tag: "create_item" | "create_items" | "query" | "analytics" | "entities" | "edit" | "scope" | "clarify";
  input: string;
  expect: Expectation;
};

const FOOD = ["aliment", "restaurante", "comida", "refeic", "lanche", "delivery"];
const TRANSPORT = ["transporte", "combustivel", "gasolina", "carro", "mobilidade"];
const SALARY = ["salario", "renda", "receita", "trabalho"];
const HOUSING = ["moradia", "casa", "aluguel", "habitac"];
const BILLS = ["conta", "luz", "energia", "moradia", "casa", "utilidade", "servico"];
const HEALTH = ["saude", "farmacia", "academia", "esporte", "bem-estar", "medic"];
const LEISURE = ["lazer", "entretenimento", "cinema", "diversao", "assinatura", "streaming"];
const GROCERY = ["mercado", "supermercado", "aliment", "compras"];
const TELECOM = ["internet", "telefon", "conta", "servico", "moradia", "casa", "utilidade"];

const item = (
    id: string,
    input: string,
    type: "income" | "expense",
    amount: number,
    date: (string | undefined)[],
    category?: string[],
  ): EvalCase => ({
    id,
    tag: "create_item",
    input,
    expect: {
      tool: ["createNewItem"],
      args: {
        type: { eq: type },
        amount: { approx: amount },
        date: { date },
        ...(category ? { suggestedCategoryName: { has: category } } : {}),
      },
    },
});

type BatchEntry = {
  type: "income" | "expense";
  amount: number;
  date: (string | undefined)[];
  category?: string[];
};

/** Several transactions in one message: expects a single batch call with all of them. */
const items = (id: string, input: string, entries: BatchEntry[]): EvalCase => ({
  id,
  tag: "create_items",
  input,
  expect: {
    tool: ["createNewItems"],
    args: {
      items: {
        items: entries.map(({ type, amount, date, category }) => ({
          type: { eq: type },
          amount: { approx: amount },
          date: { date },
          ...(category ? { suggestedCategoryName: { has: category } } : {}),
        })),
      },
    },
  },
});

export const buildDataset = (d: DateHelpers): EvalCase[] => {
  // No date in the message: the tool falls back to today when it is omitted.
  const noDate = [d.today, undefined];
  const fiveDaysAgo = d.daysAgo(5);
  const tenDaysAgo = d.daysAgo(10);

  return [
    // --- Registering transactions -------------------------------------------------
    item("item-almoco-ontem", "gastei 300 reais no almoço ontem", "expense", 300, [d.daysAgo(1)], FOOD),
    item("item-uber-hoje", "paguei 150 de uber hoje", "expense", 150, noDate, TRANSPORT),
    item("item-salario", "recebi meu salário de 5000", "income", 5000, noDate, SALARY),
    item("item-padaria", "comprei pão por 12,50 na padaria", "expense", 12.5, noDate, FOOD),
    item("item-gasolina-ontem", "ontem coloquei 200 de gasolina", "expense", 200, [d.daysAgo(1)], TRANSPORT),
    item("item-luz-anteontem", "anteontem paguei 89,90 na conta de luz", "expense", 89.9, [d.daysAgo(2)], BILLS),
    item("item-freela-dia", `recebi 1200 de um freela dia ${tenDaysAgo.slice(8, 10)}`, "income", 1200, [tenDaysAgo], SALARY),
    item("item-ifood", "gastei 45 no ifood", "expense", 45, noDate, FOOD),
    item("item-academia", "paguei a academia, 120 reais", "expense", 120, noDate, HEALTH),
    item("item-netflix", "netflix 55,90", "expense", 55.9, noDate, LEISURE),
    item("item-pix-joao", "recebi 300 de pix do joão", "income", 300, noDate),
    item("item-bicicleta", "vendi minha bicicleta por 800", "income", 800, noDate),
    item("item-aluguel-ddmm", `paguei 2 mil de aluguel dia ${d.ddmm(fiveDaysAgo)}`, "expense", 2000, [fiveDaysAgo], HOUSING),
    item("item-farmacia-ontem", "farmácia 37 reais ontem", "expense", 37, [d.daysAgo(1)], HEALTH),
    item("item-cashback", "recebi 150 de cashback", "income", 150, noDate),
    item("item-mercado", "o mercado deu 432,18", "expense", 432.18, noDate, GROCERY),
    item("item-estacionamento", "paguei 60 de estacionamento anteontem", "expense", 60, [d.daysAgo(2)], TRANSPORT),
    item("item-presente", "ganhei 250 de presente da minha vó", "income", 250, noDate),
    item("item-cinema", "cinema com a namorada, 70 reais", "expense", 70, noDate, LEISURE),
    item("item-dia-semana-passada", `dia ${d.ddmm(d.daysAgo(7))} gastei 95 no dentista`, "expense", 95, [d.daysAgo(7)], HEALTH),

    // --- Several transactions in one message -----------------------------------------
    items("batch-cafe-uber-mercado", "hoje gastei 12 de café, 38 de uber e 150 no mercado", [
      { type: "expense", amount: 12, date: noDate, category: FOOD },
      { type: "expense", amount: 38, date: noDate, category: TRANSPORT },
      { type: "expense", amount: 150, date: noDate, category: GROCERY },
    ]),
    items("batch-luz-internet-ontem", "ontem paguei 89,90 de luz e 99,90 de internet", [
      { type: "expense", amount: 89.9, date: [d.daysAgo(1)], category: BILLS },
      { type: "expense", amount: 99.9, date: [d.daysAgo(1)], category: TELECOM },
    ]),
    items("batch-salario-aluguel", "recebi 5000 de salário e paguei 2000 de aluguel", [
      { type: "income", amount: 5000, date: noDate, category: SALARY },
      { type: "expense", amount: 2000, date: noDate, category: HOUSING },
    ]),
    items("batch-datas-diferentes", "anteontem almocei por 35 e ontem jantei por 60", [
      { type: "expense", amount: 35, date: [d.daysAgo(2)], category: FOOD },
      { type: "expense", amount: 60, date: [d.daysAgo(1)], category: FOOD },
    ]),
    items("batch-lista", "lança: farmácia 37, padaria 15, estacionamento 20", [
      { type: "expense", amount: 37, date: noDate, category: HEALTH },
      { type: "expense", amount: 15, date: noDate, category: FOOD },
      { type: "expense", amount: 20, date: noDate, category: TRANSPORT },
    ]),
    items("batch-quatro", "hoje: cinema 70, pipoca 30, uber 25 e ifood 80", [
      { type: "expense", amount: 70, date: noDate, category: LEISURE },
      { type: "expense", amount: 30, date: noDate, category: [...LEISURE, ...FOOD] },
      { type: "expense", amount: 25, date: noDate, category: TRANSPORT },
      { type: "expense", amount: 80, date: noDate, category: FOOD },
    ]),

    // --- Querying transactions -----------------------------------------------------
    {
      id: "query-alimentacao-mes",
      tag: "query",
      input: "quais foram meus gastos com alimentação esse mês?",
      expect: { tool: ["listItems", "itemsAnalytics"], args: { startDate: { date: [d.firstOfMonth()] } } },
    },
    {
      id: "query-ontem",
      tag: "query",
      input: "me mostra as transações de ontem",
      expect: { tool: ["listItems"], args: { startDate: { date: [d.daysAgo(1)] }, endDate: { date: [d.daysAgo(1)] } } },
    },
    {
      id: "query-receitas-mes-passado",
      tag: "query",
      input: "quanto recebi no mês passado?",
      expect: {
        tool: ["listItems", "itemsAnalytics"],
        args: { startDate: { date: [d.firstOfMonth(-1)] }, endDate: { date: [d.lastOfMonth(-1)] } },
      },
    },
    {
      id: "query-receitas",
      tag: "query",
      input: "mostra minhas receitas",
      expect: { tool: ["listItems"], args: { type: { eq: "income" } } },
    },
    {
      id: "query-despesas-nubank",
      tag: "query",
      input: "liste as despesas da conta Nubank",
      expect: { tool: ["listItems"], args: { accountName: { has: ["nubank"] }, type: { eq: "expense" } } },
    },
    {
      id: "query-ultimos-7-dias",
      tag: "query",
      input: "transações dos últimos 7 dias",
      expect: { tool: ["listItems"], args: { startDate: { date: [d.daysAgo(7), d.daysAgo(6)] } } },
    },
    {
      id: "query-busca-uber",
      tag: "query",
      input: "procura aquele gasto com uber",
      expect: { tool: ["listItems"], args: { semanticSearch: { has: ["uber"] } } },
    },
    {
      id: "query-hoje",
      tag: "query",
      input: "o que eu gastei hoje?",
      expect: { tool: ["listItems", "itemsAnalytics"], args: { startDate: { date: [d.today] } } },
    },

    // --- Analytics and charts ------------------------------------------------------
    {
      id: "analytics-categoria-3m",
      tag: "analytics",
      input: "faz um gráfico dos meus gastos por categoria nos últimos 3 meses",
      expect: {
        tool: ["itemsAnalytics"],
        args: { metric: { eq: "total_expenses" }, groupBy: { includes: "category" } },
      },
    },
    {
      id: "analytics-saldo-ano",
      tag: "analytics",
      input: "como evoluiu meu saldo mês a mês este ano?",
      expect: {
        tool: ["itemsAnalytics"],
        args: { metric: { eq: "balance" }, groupBy: { includes: "month" }, startDate: { date: [d.firstOfYear()] } },
      },
    },
    {
      id: "analytics-receitas-despesas-6m",
      tag: "analytics",
      input: "compare minhas receitas e despesas dos últimos 6 meses",
      expect: { tool: ["itemsAnalytics"], args: { groupBy: { includes: "month" } } },
    },
    {
      id: "analytics-contagem-mes",
      tag: "analytics",
      input: "quantas transações eu fiz esse mês?",
      expect: { tool: ["itemsAnalytics", "listItems"], args: { startDate: { date: [d.firstOfMonth()] } } },
    },
    {
      id: "analytics-conta-mes-passado",
      tag: "analytics",
      input: "gráfico de gastos por conta no mês passado",
      expect: {
        tool: ["itemsAnalytics"],
        args: {
          metric: { eq: "total_expenses" },
          groupBy: { includes: "account" },
          startDate: { date: [d.firstOfMonth(-1)] },
          endDate: { date: [d.lastOfMonth(-1)] },
        },
      },
    },
    {
      id: "analytics-gastos-por-mes-ano",
      tag: "analytics",
      input: "quanto gastei em cada mês desse ano?",
      expect: {
        tool: ["itemsAnalytics"],
        args: { metric: { eq: "total_expenses" }, groupBy: { includes: "month" }, startDate: { date: [d.firstOfYear()] } },
      },
    },

    // --- Accounts, cards, categories and goals ---------------------------------------
    {
      id: "entity-conta-itau",
      tag: "entities",
      input: "cria uma conta no Itaú chamada Conta Corrente com 1500 de saldo",
      expect: {
        tool: ["createNewAccount"],
        args: { name: { has: ["corrente"] }, financialInstitution: { has: ["itau"] }, balance: { approx: 1500 } },
      },
    },
    {
      id: "entity-conta-carteira",
      tag: "entities",
      input: "adicionar conta Carteira com 200 reais",
      expect: { tool: ["createNewAccount"], args: { name: { has: ["carteira"] }, balance: { approx: 200 } } },
    },
    {
      id: "entity-cartao-nubank",
      tag: "entities",
      input: "quero cadastrar meu cartão Nubank com limite de 3000",
      expect: { tool: ["createNewCreditCard"], args: { financialInstitution: { has: ["nubank"] }, limit: { approx: 3000 } } },
    },
    {
      id: "entity-categoria-pets",
      tag: "entities",
      input: "cria a categoria Pets",
      expect: { tool: ["createNewCategory"], args: { name: { has: ["pet"] } } },
    },
    { id: "entity-listar-categorias", tag: "entities", input: "quais categorias eu tenho?", expect: { tool: ["listCategories"] } },
    { id: "entity-listar-contas", tag: "entities", input: "quais são minhas contas?", expect: { tool: ["listAccounts", "filterAccounts"] } },
    { id: "entity-listar-cartoes", tag: "entities", input: "meus cartões", expect: { tool: ["listCreditCards"] } },
    {
      id: "entity-meta-viagem",
      tag: "entities",
      input: "quero juntar 10 mil para uma viagem até dezembro",
      expect: { tool: ["createNewGoal"], args: { targetAmount: { approx: 10000 }, deadline: { startsWith: `${d.year}-12` } } },
    },
    { id: "entity-listar-metas", tag: "entities", input: "como estão minhas metas?", expect: { tool: ["listGoals"] } },
    {
      id: "entity-metas-batidas",
      tag: "entities",
      input: "quais metas eu já bati?",
      expect: { tool: ["listGoals"], args: { status: { eq: "achieved" } } },
    },

    // --- Edits and deletions: the agent must find the record first ----------------------
    { id: "edit-apagar-uber", tag: "edit", input: "apaga a transação do uber de ontem", expect: { tool: ["listItems", "deleteItem"] } },
    { id: "edit-valor-almoco", tag: "edit", input: "muda o valor do almoço de ontem para 35", expect: { tool: ["listItems", "editItem"] } },

    // --- Out of scope: must refuse without calling tools --------------------------------
    { id: "scope-capital", tag: "scope", input: "qual a capital da França?", expect: { noTool: true } },
    { id: "scope-poema", tag: "scope", input: "me escreve um poema sobre o mar", expect: { noTool: true } },
    { id: "scope-cdb", tag: "scope", input: "quanto rendeu meu CDB este mês?", expect: { noTool: true } },
    { id: "scope-bitcoin", tag: "scope", input: "devo investir em bitcoin?", expect: { noTool: true } },
    { id: "scope-python", tag: "scope", input: "me ajuda a corrigir um código python", expect: { noTool: true } },
    { id: "scope-futebol", tag: "scope", input: "quem ganhou o jogo do Flamengo ontem?", expect: { noTool: true } },

    // --- Ambiguous: must ask for clarification before acting ------------------------------
    { id: "clarify-lanca-200", tag: "clarify", input: "lança 200", expect: { noTool: true } },
    { id: "clarify-apaga-tudo", tag: "clarify", input: "apaga tudo", expect: { noTool: true } },
    { id: "clarify-exclui-conta", tag: "clarify", input: "exclui minha conta", expect: { noTool: true } },
    { id: "clarify-gastei", tag: "clarify", input: "gastei", expect: { noTool: true } },
  ];
};

/**
 * Held-out set: written after the main set was used to tune the prompt and never
 * used for tuning. Different wording on purpose (slang, abbreviations, numbers in
 * words or with thousands separators) to check that fixes generalize.
 */
export const buildHoldoutDataset = (d: DateHelpers): EvalCase[] => {
  const noDate = [d.today, undefined];
  const threeDaysAgo = d.daysAgo(3);

  return [
    item("h-item-uber", "uber pra casa 23,40", "expense", 23.4, noDate, TRANSPORT),
    item("h-item-salario-hj", "caiu 3.250,00 de salário hj", "income", 3250, noDate, SALARY),
    item("h-item-lanche-extenso", "gastei trinta reais de lanche", "expense", 30, noDate, FOOD),
    item("h-item-internet-ontem", "paguei a fatura da internet ontem, 99,90", "expense", 99.9, [d.daysAgo(1)], TELECOM),
    item("h-item-remedio", "comprei remédio 48 reais anteontem", "expense", 48, [d.daysAgo(2)], HEALTH),
    item("h-item-reembolso", "recebi 75 de reembolso da empresa", "income", 75, noDate),
    item("h-item-condominio", `dia ${threeDaysAgo.slice(8, 10)} paguei 1.100 de condomínio`, "expense", 1100, [threeDaysAgo], HOUSING),
    item("h-item-spotify", "spotify 21,90", "expense", 21.9, noDate, LEISURE),
    item("h-item-happy-hour", "ontem rolou um happy hour, gastei 120", "expense", 120, [d.daysAgo(1)], [...LEISURE, ...FOOD]),
    item("h-item-aluguel-recebido", "transferiram 500 pra mim do aluguel do apê", "income", 500, noDate),

    items("h-batch-gasolina-lavagem", "abasteci 200 e lavei o carro por 50", [
      { type: "expense", amount: 200, date: noDate, category: TRANSPORT },
      { type: "expense", amount: 50, date: noDate, category: TRANSPORT },
    ]),
    items("h-batch-freela-pix", "caiu 800 de um freela e 120 de um pix do pedro", [
      { type: "income", amount: 800, date: noDate },
      { type: "income", amount: 120, date: noDate },
    ]),
    items("h-batch-mercado-farmacia-ontem", "ontem: mercado 230,50 e farmácia 42", [
      { type: "expense", amount: 230.5, date: [d.daysAgo(1)], category: GROCERY },
      { type: "expense", amount: 42, date: [d.daysAgo(1)], category: HEALTH },
    ]),

    {
      id: "h-query-entradas-mes",
      tag: "query",
      input: "o que entrou de dinheiro esse mês?",
      expect: { tool: ["listItems", "itemsAnalytics"], args: { startDate: { date: [d.firstOfMonth()] } } },
    },
    {
      id: "h-query-anteontem",
      tag: "query",
      input: "lista meus gastos de anteontem",
      expect: { tool: ["listItems"], args: { startDate: { date: [d.daysAgo(2)] }, endDate: { date: [d.daysAgo(2)] } } },
    },
    {
      id: "h-query-netflix",
      tag: "query",
      input: "acha a compra da netflix",
      expect: { tool: ["listItems"], args: { semanticSearch: { has: ["netflix"] } } },
    },
    {
      id: "h-query-itau",
      tag: "query",
      input: "despesas no itaú",
      expect: { tool: ["listItems"], args: { accountName: { has: ["itau"] }, type: { eq: "expense" } } },
    },

    {
      id: "h-analytics-saldo",
      tag: "analytics",
      input: "quero ver um gráfico do meu saldo nos últimos meses",
      expect: { tool: ["itemsAnalytics"], args: { metric: { eq: "balance" }, groupBy: { includes: "month" } } },
    },
    {
      id: "h-analytics-top-categoria",
      tag: "analytics",
      input: "qual categoria eu mais gastei no mês passado?",
      expect: { tool: ["itemsAnalytics", "listItems"], args: { startDate: { date: [d.firstOfMonth(-1)] } } },
    },
    {
      id: "h-analytics-distribuicao-ano",
      tag: "analytics",
      input: "distribuição dos gastos por categoria este ano",
      expect: {
        tool: ["itemsAnalytics"],
        args: { metric: { eq: "total_expenses" }, groupBy: { includes: "category" }, startDate: { date: [d.firstOfYear()] } },
      },
    },

    {
      id: "h-entity-conta-inter",
      tag: "entities",
      input: "abre uma conta Inter com saldo zero",
      expect: { tool: ["createNewAccount"], args: { financialInstitution: { has: ["inter"] }, balance: { approx: 0 } } },
    },
    {
      id: "h-entity-cartao-xp",
      tag: "entities",
      input: "cartão XP limite 8 mil",
      expect: { tool: ["createNewCreditCard"], args: { financialInstitution: { has: ["xp"] }, limit: { approx: 8000 } } },
    },
    {
      id: "h-entity-categoria-educacao",
      tag: "entities",
      input: "nova categoria: educação",
      expect: { tool: ["createNewCategory"], args: { name: { has: ["educa"] } } },
    },
    {
      id: "h-entity-meta-reserva",
      tag: "entities",
      input: "meta: reserva de emergência de 20 mil",
      expect: { tool: ["createNewGoal"], args: { targetAmount: { approx: 20000 } } },
    },

    { id: "h-scope-tempo", tag: "scope", input: "qual a previsão do tempo amanhã?", expect: { noTool: true } },
    { id: "h-scope-acoes", tag: "scope", input: "vale a pena comprar ações da Petrobras?", expect: { noTool: true } },

    { id: "h-clarify-registra", tag: "clarify", input: "registra aí", expect: { noTool: true } },
    { id: "h-clarify-apaga-todos", tag: "clarify", input: "apaga meus lançamentos todos", expect: { noTool: true } },
    { id: "h-clarify-recebi", tag: "clarify", input: "recebi", expect: { noTool: true } },
  ];
};
