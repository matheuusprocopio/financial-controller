import { tool } from "ai";
import { z } from "zod";
import { listCategories, listCategoriesPaginated } from "@/utils/services/categories";
import { listAccounts, listAccountsPaginated } from "@/utils/services/accounts";
import { listItems, getItemById } from "@/utils/services/items";
import { getSessionId } from "@/utils/server-cookies";
import { findBestMatch } from "@/utils/fuzzySearch";
import { getLocalIsoDate } from "@/utils/date";
import type { FuzzyMatchResult } from "@/utils/fuzzySearch";
import { ItemType } from "@/types/item.type";
import { RequestError, createRequestError } from "@/utils/requestProvider";
import { isRequestError, MIN_MATCH_CONFIDENCE, resolveIsoDate } from "./shared";
import { categorySearchTerm, resolveBatchRow, type NamedOption } from "./itemsBatch";

export const createNewItemTool = tool({
  description: `Create or add a new transaction (item) to user. Use it only when the message has a single transaction; for two or more, use createNewItems. Analyze the user's message and automatically determine:
  - If it's income (received money, salary, payment received) or expense (spent money, paid, bought)
  - Suggest the most appropriate category based on the context (e.g., "almoço" -> food category, "uber" -> transport)
  - Suggest the most appropriate account if mentioned or use default
  - Extract the transaction date from the message (default to today when missing) and convert it to ISO 8601 (YYYY-MM-DD)
  - Extract the amount from the message
  
  Examples:
  - "gastei 300 reais no almoço ontem" -> expense, food category, 300, today's date minus one day
  - "recebi meu salário de 5000 dia 05" -> income, salary category, 5000, the most recent past day 05
  - "paguei 150 de uber dia 12/04" -> expense, transport category, 150, April 12 of the current year (previous year if that is in the future)
  Always compute dates from today's date given in the system prompt.`,
  
  inputSchema: z.object({
    name: z.string().describe("Short name for the transaction (e.g., 'Almoço', 'Uber', 'Salário')"),
    description: z.string().describe("Detailed description extracted from user message"),
    amount: z.number().positive("Amount must be positive").describe("The monetary amount"),
    type: z.enum(["income", "expense"]).describe("Automatically determined: 'income' if received money, 'expense' if spent/paid"),
    date: z.string().describe("Transaction date converted to ISO 8601 (YYYY-MM-DD). When the user does not mention a date, use today's date."),
    suggestedCategoryName: z.string().optional().describe("Suggest category name based on context (e.g., 'Alimentação', 'Transporte', 'Salário')"),
    suggestedAccountName: z.string().optional().describe("Suggest account name if mentioned by user"),
  }),
  execute: async ({ name, description, amount, type, date, suggestedCategoryName, suggestedAccountName }) => {
    const parsedDate = resolveIsoDate(date);
    const sessionId = await getSessionId();

    if (!sessionId) {
      return {
        name,
        description,
        amount,
        date: parsedDate,
        type,
        categoryId: "",
        accountId: "",
        error: createRequestError(
          401,
          "Não foi possível obter a sessão do usuário.",
          "items"
        ),
        suggestedCategoryName,
        suggestedAccountName,
      };
    }

    const categorySearchTerm =
      suggestedCategoryName?.trim() ||
      name?.trim() ||
      description?.trim() ||
      "";
    const accountSearchTerm =
      suggestedAccountName?.trim() ||
      name?.trim() ||
      description?.trim() ||
      "";
    const [categoriesResp, accountsResp] = await Promise.all([
      listCategoriesPaginated(sessionId, { page: 1, size: 5 }, undefined, categorySearchTerm || undefined),
      listAccountsPaginated(sessionId, { page: 1, size: 10 }, accountSearchTerm || undefined),
    ]);

    if (isRequestError(categoriesResp)) {
      return {
        name,
        description,
        amount,
        date: parsedDate,
        type,
        categoryId: "",
        accountId: "",
        error: categoriesResp,
        suggestedCategoryName,
        suggestedAccountName,
      };
    }

    if (isRequestError(accountsResp)) {
      return {
        name,
        description,
        amount,
        date: parsedDate,
        type,
        categoryId: "",
        accountId: "",
        error: accountsResp,
        suggestedCategoryName,
        suggestedAccountName,
      };
    }

    const categories = categoriesResp.data ?? [];
    const accounts = accountsResp.data ?? [];

    if (categories.length === 0) {
      return {
        name,
        description,
        amount,
        date: parsedDate,
        type,
        categoryId: "",
        accountId: "",
        error: createRequestError(404, "Nenhuma categoria encontrada. Crie uma categoria primeiro.", "categories"),
        suggestedCategoryName,
        suggestedAccountName,
      };
    }

    if (accounts.length === 0) {
      return {
        name,
        description,
        amount,
        date: parsedDate,
        type,
        categoryId: "",
        accountId: "",
        error: createRequestError(404, "Nenhuma conta encontrada. Crie uma conta primeiro.", "accounts"),
        suggestedCategoryName,
        suggestedAccountName,
      };
    }

    const matchedCategory =
      categories.length > 0
        ? findBestMatch(categories, suggestedCategoryName, (cat) => cat.name)
        : undefined;
    const matchedAccount =
      accounts.length > 0
        ? findBestMatch(accounts, suggestedAccountName, (acc) => acc.name)
        : undefined;

    const resolvedCategory =
      matchedCategory && matchedCategory.confidence >= MIN_MATCH_CONFIDENCE
        ? matchedCategory
        : undefined;
    const resolvedAccount =
      matchedAccount && matchedAccount.confidence >= MIN_MATCH_CONFIDENCE
        ? matchedAccount
        : undefined;

    const needsCategorySelection = !resolvedCategory;
    const needsAccountSelection = !resolvedAccount;

    return {
      name,
      description,
      amount,
      date: parsedDate,
      type,
      categoryId: resolvedCategory?.id ?? "",
      accountId: resolvedAccount?.id ?? "",
      suggestedCategoryName: resolvedCategory?.name ?? suggestedCategoryName,
      suggestedAccountName: resolvedAccount?.name ?? suggestedAccountName,
      categories,
      accounts,
      needsCategorySelection,
      needsAccountSelection,
      matchConfidence: {
        category: matchedCategory?.confidence ?? 0,
        account: matchedAccount?.confidence ?? 0,
      },
    };
  },
});

const batchItemSchema = z.object({
  name: z.string().describe("Short name for the transaction (e.g., 'Café', 'Uber', 'Mercado')"),
  description: z.string().describe("Detailed description extracted from user message"),
  amount: z.number().positive("Amount must be positive").describe("The monetary amount of this transaction only"),
  type: z.enum(["income", "expense"]).describe("'income' if received money, 'expense' if spent/paid"),
  date: z.string().describe("This transaction's date in ISO 8601 (YYYY-MM-DD). When the user does not mention a date, use today's date."),
  suggestedCategoryName: z.string().optional().describe("Suggest category name based on context (e.g., 'Alimentação', 'Transporte', 'Salário')"),
  suggestedAccountName: z.string().optional().describe("Suggest account name if mentioned by user"),
});

const toOptions = (list: { id: string; name: string }[]): NamedOption[] =>
  list.map(({ id, name }) => ({ id, name }));

export const createNewItemsTool = tool({
  description: `Create several transactions (items) at once when one message mentions two or more of them.
  Call it a single time with one entry per transaction, instead of calling createNewItem several times.
  For each entry apply the same rules as createNewItem: income or expense, amount, suggested category and account, and its own date in ISO 8601 (YYYY-MM-DD).
  A date or account mentioned once applies to every transaction it refers to.

  Examples:
  - "hoje gastei 12 de café, 38 de uber e 150 no mercado" -> 3 expenses dated today: café (food), uber (transport), mercado (groceries)
  - "recebi 5000 de salário e paguei 2000 de aluguel" -> income 5000 (salary) and expense 2000 (housing)
  - "anteontem almocei por 35 e ontem jantei por 60" -> 35 dated today minus two days, 60 dated today minus one day
  Always compute dates from today's date given in the system prompt.`,

  inputSchema: z.object({
    items: z.array(batchItemSchema).min(1).max(20).describe("One entry per transaction mentioned in the message"),
  }),

  execute: async ({ items }) => {
    const rows = items.map((item) => ({ ...item, date: resolveIsoDate(item.date) }));
    const sessionId = await getSessionId();

    if (!sessionId) {
      return { items: rows, error: createRequestError(401, "Não foi possível obter a sessão do usuário.", "items") };
    }

    // One semantic search per transaction, in parallel with the full lists used as form options.
    const [categoriesResp, accountsResp, candidatesResps] = await Promise.all([
      listCategories(sessionId),
      listAccounts(sessionId),
      Promise.all(
        items.map((item) =>
          listCategoriesPaginated(sessionId, { page: 1, size: 5 }, undefined, categorySearchTerm(item) || undefined),
        ),
      ),
    ]);

    if (isRequestError(categoriesResp)) return { items: rows, error: categoriesResp };
    if (isRequestError(accountsResp)) return { items: rows, error: accountsResp };

    const categories = toOptions(categoriesResp ?? []);
    const accounts = toOptions(accountsResp ?? []);

    if (categories.length === 0) {
      return { items: rows, error: createRequestError(404, "Nenhuma categoria encontrada. Crie uma categoria primeiro.", "categories") };
    }
    if (accounts.length === 0) {
      return { items: rows, error: createRequestError(404, "Nenhuma conta encontrada. Crie uma conta primeiro.", "accounts") };
    }

    return {
      items: items.map((item, i) => {
        const resp = candidatesResps[i];
        // If this search failed, fuzzy-match against every category instead.
        const candidates = isRequestError(resp) || !resp.data?.length ? categories : toOptions(resp.data);
        return resolveBatchRow(item, candidates, accounts);
      }),
      categories,
      accounts,
    };
  },
});

export const editItemTool = tool({
  description: "Edit an existing transaction (item)",
  inputSchema: z.object({
    itemId: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    amount: z.number().optional(),
    date: z.string().optional(),
    type: z.enum(["income", "expense"]).optional(),
    categoryId: z.string().optional(),
    accountId: z.string().optional(),
  }),

  execute: async ({ itemId, name, description, amount, date, type, categoryId, accountId }) => {
    const computeDate = (fallback?: string | null) => resolveIsoDate(date, fallback);
    const sessionId = await getSessionId();

    const baseResponse = (extra: Record<string, unknown> = {}) => ({
      itemId: itemId ?? "",
      name: name ?? "",
      description: description ?? "",
      amount: amount ?? 0,
      date: computeDate(),
      type: type ?? "expense",
      categoryId: categoryId ?? "",
      accountId: accountId ?? "",
      ...extra,
    });

    if (!sessionId) {
      return baseResponse({
        error: createRequestError(
          401,
          "Não foi possível obter a sessão do usuário.",
          `items/${itemId ?? ""}`
        ),
      });
    }

    try {
      let resolvedItem: ItemType | null = null;
      let fuzzyMatch: FuzzyMatchResult | undefined;
      let semanticalSearchTerm: string | undefined;

      const trimmedItemId = itemId?.trim();

      if (trimmedItemId) {
        const resp = await getItemById(trimmedItemId, sessionId);

        if (isRequestError(resp)) {
          return baseResponse({ error: resp });
        }

        if (resp) {
          resolvedItem = resp;
        }
      }

      if (!resolvedItem) {
        const candidateTerms = [name, description]
          .map((value) => value?.trim())
          .filter((value): value is string => Boolean(value));

        if (candidateTerms.length > 0) {
          semanticalSearchTerm = candidateTerms.join(" ");
        }

        if (!semanticalSearchTerm) {
          return baseResponse({
            error: createRequestError(
              400,
              "Forneça o nome ou a descrição da transação para localizar via busca semântica.",
              "items"
            ),
          });
        }

        const listResp = await listItems(sessionId, {
          semanticalSearch: semanticalSearchTerm,
          page: 1,
          pageLimit: 5,
        });

        if (isRequestError(listResp)) {
          return baseResponse({
            semanticalSearch: semanticalSearchTerm,
            error: listResp,
          });
        }

        const items = listResp.data ?? [];

        if (items.length === 0) {
          return baseResponse({
            semanticalSearch: semanticalSearchTerm,
            error: createRequestError(
              404,
              "Nenhuma transação encontrada para editar. Tente especificar melhor o nome ou a descrição.",
              "items"
            ),
          });
        }

        const match = findBestMatch(
          items,
          semanticalSearchTerm,
          (candidate) => {
            const label = `${candidate.name ?? ""} ${candidate.description ?? ""}`.trim();
            return label.length > 0 ? label : candidate.name;
          }
        );

        fuzzyMatch = match;
        resolvedItem = items.find((candidate) => candidate.id === match.id) ?? items[0];
      }

      if (!resolvedItem) {
        return baseResponse({
          error: createRequestError(404, "Transação não encontrada.", `items/${itemId ?? ""}`),
        });
      }

      return {
        itemId: resolvedItem.id,
        name: name ?? resolvedItem.name,
        description: description ?? resolvedItem.description,
        amount: amount ?? resolvedItem.amount,
        date: computeDate(resolvedItem.date),
        type: type ?? resolvedItem.type,
        categoryId: categoryId ?? resolvedItem.categoryId,
        accountId: accountId ?? resolvedItem.accountId,
        semanticalSearch: trimmedItemId ? undefined : semanticalSearchTerm,
        matchConfidence: fuzzyMatch ? { item: fuzzyMatch.confidence } : undefined,
      };
    } catch (error) {
      return baseResponse({
        error: isRequestError(error)
          ? error
          : createRequestError(
              500,
              error instanceof Error ? error.message : "Unknown error",
              `items/${itemId ?? ""}`
            ),
      });
    }
  },
});

export const deleteItemTool = tool({
  description: "Excludes a transaction (item)",
  inputSchema: z.object({
    itemId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    amount: z.number().optional(),
    date: z.string().optional(),
    type: z.enum(["income", "expense"]).optional(),
  }),

  execute: async ({ itemId, name, description, amount, date, type }) => {
    return {
      itemId,
      name,
      description,
      amount,
      date,
      type,
    };
  },
});

type ListItemsSubgroupResult =
  | {
      categoryMatch?: FuzzyMatchResult;
      accountMatch?: FuzzyMatchResult;
    }
  | { error: RequestError };

const resolveListItemsSubgroupFilters = async (
  sessionId: string,
  {
    categoryName,
    accountName,
  }: { categoryName?: string; accountName?: string }
): Promise<ListItemsSubgroupResult> => {
  const trimmedCategoryName = categoryName?.trim();
  const trimmedAccountName = accountName?.trim();

  let categoryMatch: FuzzyMatchResult | undefined;
  let accountMatch: FuzzyMatchResult | undefined;

  if (trimmedCategoryName) {
    const categoriesResp = await listCategoriesPaginated(
      sessionId,
      { page: 1, size: 5 },
      undefined,
      trimmedCategoryName
    );

    if (isRequestError(categoriesResp)) {
      return { error: categoriesResp };
    }

    const categories = categoriesResp.data ?? [];
    if (categories.length === 0) {
      return {
        error: createRequestError(
          404,
          `Nenhuma categoria encontrada para "${trimmedCategoryName}".`,
          "categories/paginated"
        ),
      };
    }

    categoryMatch = findBestMatch(categories, trimmedCategoryName, (cat) => cat.name);
  }

  if (trimmedAccountName) {
    const accountsResp = await listAccountsPaginated(
      sessionId,
      { page: 1, size: 5 },
      trimmedAccountName
    );

    if (isRequestError(accountsResp)) {
      return { error: accountsResp };
    }

    const accounts = accountsResp.data ?? [];
    if (accounts.length === 0) {
      return {
        error: createRequestError(
          404,
          `Nenhuma conta encontrada para "${trimmedAccountName}".`,
          "accounts/paginated"
        ),
      };
    }

    accountMatch = findBestMatch(accounts, trimmedAccountName, (acc) => acc.name);
  }

  return { categoryMatch, accountMatch };
};

export const listItemsTool = tool({
  description: `List user transactions (items) by interpreting natural language filters.
  
  Responsibilities:
  - Understand the time range requested in the user's message (e.g., "últimos 15 dias", "março inteiro", "de 10 a 20 de abril").
  - Convert every interpreted date to ISO 8601 (YYYY-MM-DD). When the user omits the start date, leave it undefined (full history). When the user omits the end date, use today's ISO date.
  - Detect category or account references and map them to existing records to limit the search to that subgroup.
    * Categoria = o tipo de gasto/receita (ex.: Alimentação, Transporte, Salário).
    * Conta = onde o dinheiro está/foi movimentado (ex.: Nubank, Itaú, Carteira física).
  - Provide optional filtering by transaction type (income/expense).
  - Keep responses concise so the UI can show totals, pagination and error states.
  
  Examples:
  - "gastos do mês passado" -> startDate first day of last month, endDate last day of last month, semantic search empty.
  - "transações de janeiro de 2024" -> startDate 2024-01-01, endDate 2024-01-31.
  - "mostre receitas desta semana no Nubank" -> startDate Monday ISO date, endDate Sunday ISO date, type income, account resolved to Nubank.
  - "me mostre tudo" -> startDate undefined, endDate today ISO, no other filters.`,
  
  inputSchema: z.object({
    semanticSearch: z.string().optional().describe("Semantic / free-text search term interpreted from the user request."),
    categoryName: z.string().optional().describe("User-mentioned category (tipo de gasto/receita) to narrow results, e.g., 'Alimentação', 'Transporte', 'Salário'."),
    accountName: z.string().optional().describe("User-mentioned account (onde o dinheiro está/foi) to narrow results, e.g., 'Nubank', 'Itaú', 'Carteira'."),
    startDate: z.string().optional().describe("Start date interpreted from user request, converted to ISO YYYY-MM-DD. Leave undefined for full history when the user does not specify."),
    endDate: z.string().optional().describe("End date interpreted from user request, converted to ISO YYYY-MM-DD. Use today's ISO date when the user does not specify."),
    type: z.enum(["income", "expense"]).optional().describe("Filter by transaction type: 'income' for received money, 'expense' for spent money"),
  
  }),

  execute: async ({ semanticSearch = "", categoryName, accountName, startDate, endDate, type }) => {
    const todayIso = getLocalIsoDate();
    const sanitizedStartDate = startDate?.trim();
    const sanitizedEndDate = endDate?.trim();
    const finalStartDate =
      sanitizedStartDate && sanitizedStartDate.length > 0 ? sanitizedStartDate : undefined;
    const finalEndDate =
      sanitizedEndDate && sanitizedEndDate.length > 0 ? sanitizedEndDate : todayIso;
    const sanitizedSemantic = semanticSearch?.trim();
    const finalSemanticSearch =
      sanitizedSemantic && sanitizedSemantic.length > 0 ? sanitizedSemantic : undefined;
    const trimmedCategoryName = categoryName?.trim();
    const trimmedAccountName = accountName?.trim();
    let categoryMatch: FuzzyMatchResult | undefined;
    let accountMatch: FuzzyMatchResult | undefined;

    const attachFilterMetadata = <T extends Record<string, unknown>>(payload: T) => ({
      ...payload,
      categoryId: categoryMatch?.id,
      categoryName: categoryMatch?.name ?? trimmedCategoryName,
      accountId: accountMatch?.id,
      accountName: accountMatch?.name ?? trimmedAccountName,
      matchConfidence:
        categoryMatch || accountMatch
          ? {
              category: categoryMatch?.confidence,
              account: accountMatch?.confidence,
            }
          : undefined,
    });

    const sessionId = await getSessionId();
    
    if (!sessionId) {
      return attachFilterMetadata({
        startDate: finalStartDate,
        endDate: finalEndDate,
        semanticSearch: finalSemanticSearch,
        type: type || "all",
        data: [],
        totalItems: 0,
        error: createRequestError(
          401,
          "Não foi possível obter a sessão do usuário.",
          "items"
        ),
      });
    }

    if (trimmedCategoryName || trimmedAccountName) {
      const subgroupResult = await resolveListItemsSubgroupFilters(sessionId, {
        categoryName: trimmedCategoryName,
        accountName: trimmedAccountName,
      });

      console.log(subgroupResult);

      if ("error" in subgroupResult) {
        return attachFilterMetadata({
          semanticSearch: finalSemanticSearch,
          startDate: finalStartDate,
          endDate: finalEndDate,
          type: type || "all",
          data: [],
          totalItems: 0,
          error: subgroupResult.error,
        });
      }

      categoryMatch = subgroupResult.categoryMatch;
      accountMatch = subgroupResult.accountMatch;
    }

    try {
      const resp = await listItems(sessionId, {
        semanticalSearch: finalSemanticSearch,
        categoryId: categoryMatch?.id,
        accountId: accountMatch?.id,
        startDate: finalStartDate,
        endDate: finalEndDate,
        type: type || undefined,
        page: 1,
        pageLimit: 10,
      });

      if (isRequestError(resp)) {
        return attachFilterMetadata({
          semanticSearch: finalSemanticSearch,
          startDate: finalStartDate,
          endDate: finalEndDate,
          type: type || "all",
          data: [],
          totalItems: 0,
          error: resp,
        });
      }

      const filteredData = resp.data?.filter((item) => {
        const matchCategory = categoryMatch ? item.categoryId === categoryMatch.id : true;
        const matchAccount = accountMatch ? item.accountId === accountMatch.id : true;
        return matchCategory && matchAccount;
      });
      const filteredTotal =
        categoryMatch || accountMatch ? filteredData?.length ?? 0 : resp.totalItems;

      return attachFilterMetadata({
        semanticSearch: finalSemanticSearch,
        startDate: finalStartDate,
        endDate: finalEndDate,
        type: type || "all",
        data: filteredData ?? resp.data,
        totalItems: filteredTotal,
        currentPage: resp.currentPage,
        pageLimit: resp.pageLimit,
      });
    } catch (error) {
      return attachFilterMetadata({
        semanticSearch: finalSemanticSearch,
        startDate: finalStartDate,
        endDate: finalEndDate,
        type: type || "all",
        data: [],
        totalItems: 0,
        error: isRequestError(error)
          ? error
          : createRequestError(
              500,
              error instanceof Error ? error.message : "Unknown error",
              "items"
            ),
      });
    }
  },
});

export const listItemActionsTool = tool({
  description: "List the available actions for transactions (items)",
  inputSchema: z.object({}),

  execute: async () => {
    return "Items available list";
  },
});
//
