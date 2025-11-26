import { creditCardsMock } from "@/data/creditCardsMock";
import { tool } from "ai";
import { z } from "zod";

import { listCategoriesPaginated } from "@/utils/services/categories";
import { listAccountsPaginated, getAccountById, listAccounts } from "@/utils/services/accounts";
import { listGoals, getGoalById } from "@/utils/services/goals";
import { listItems, getItemById } from "@/utils/services/items";
import { getSessionId } from "@/utils/server-cookies";
import { findBestMatch } from "@/utils/fuzzySearch";
import type { FuzzyMatchResult } from "@/utils/fuzzySearch";

import { AccountType } from "@/types/account.type";
import { GoalType } from "@/types/goal.types";
import { RequestError, createRequestError } from "@/utils/requestProvider";

const isRequestError = (resp: unknown): resp is RequestError => {
  return !!resp && typeof resp === "object" && "error" in (resp as Record<string, unknown>);
};

export const createNewCategoryTool = tool({
  description: "Create or add a new category or sub-category to user",
  inputSchema: z.object({
    name: z.string().optional(),
    imagePath: z.string().optional(),
    mainCategoryId: z.string().optional(),
  }),

  execute: async ({ name = "", imagePath = "", mainCategoryId }) => {
    return {
      name,
      imagePath,
      mainCategoryId,
    };
  },
});

export const editCategoryTool = tool({
  description: "Edit an existing category",
  inputSchema: z.object({
    categoryId: z.string(),
    name: z.string().optional(),
    imagePath: z.string().optional(),
    mainCategoryId: z.string().optional(),
  }),

  execute: async ({ categoryId, name, imagePath, mainCategoryId }) => {
    return {
      categoryId,
      name,
      imagePath,
      mainCategoryId,
    };
  },
});

export const deleteCategoryTool = tool({
  description: "Excludes a category or sub-category",
  inputSchema: z.object({
    categoryId: z.string().optional(),
    name: z.string(),
  }),

  execute: async ({ categoryId = "", name }) => {
    try {
      const sessionId = await getSessionId();

      if (!sessionId) {
        return {
          categoryId: "",
          name,
          error: createRequestError(
            401,
            "Não foi possível obter a sessão do usuário.",
            "categories/paginated"
          ),
        };
      }

      const resp = await listCategoriesPaginated(
        sessionId,
        { page: 1, size: 1 },
        undefined,
        name
      );

      if (isRequestError(resp)) {
        return {
          categoryId: "",
          name,
          error: resp,
        };
      }

      const [bestMatch] = resp.data ?? [];

      if (!bestMatch) {
        return {
          categoryId: "",
          name,
          error: createRequestError(
            404,
            "Nenhuma categoria encontrada para deletar. Tente especificar melhor o nome.",
            "categories/paginated"
          ),
        };
      }

      return {
        categoryId: bestMatch.id,
        name: bestMatch.name,
        semanticalSearch: name,
        totalOfCategories: resp.totalItems,
      };
    } catch (error) {
      if (isRequestError(error)) {
        return {
          categoryId: "",
          name,
          error,
        };
      }

      const message = error instanceof Error ? error.message : "Unknown error";

      return {
        categoryId: "",
        name,
        error: createRequestError(500, message, "categories/paginated"),
      };
    }
  },
});

export const listCategoryActionsTool = tool({
  description: "List the available actions for categories",
  inputSchema: z.object({}),

  execute: async () => {
    return "Categories available list";
  },
});

export const listCategoriesTool = tool({
  description: "List the available categories",
  inputSchema: z.object({
    name: z.string().optional(),
  }),

  execute: async ({ name = "" }) => {
    try {
      const sessionId = await getSessionId();

      if (!sessionId) {
        return {
          name,
          categories: [],
          totalOfCategories: 0,
          error: {
            error: {
              status: 401,
              message: "Não foi possível obter os dados do usuário.",
              resource: "categories/paginated",
            },
          },
        };
      }

      const searchTerm = name.length > 0 ? name : undefined;

      const resp = await listCategoriesPaginated(
        sessionId,
        { page: 1, size: 10 },
        name,
        searchTerm
      );

      if (isRequestError(resp)) {
        return {
          name,
          categories: [],
          totalOfCategories: 0,
          error: resp,
        };
      }

      return {
        name,
        categories: resp.data,
        totalOfCategories: resp.totalItems,
        currentPage: resp.currentPage,
        pageLimit: resp.pageLimit,
      };
    } catch (error) {
      if (isRequestError(error)) {
        return {
          name,
          categories: [],
          totalOfCategories: 0,
          error,
        };
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        name,
        categories: [],
        totalOfCategories: 0,
        error: {
          error: {
            status: 500,
            message: errorMessage,
            resource: "categories/paginated",
          },
        },
      };
    }
  },
});
//

// credit card
export const createNewCreditCardTool = tool({
  description:
    "Create or add a new credit card to user. The dueDate should be in format YYYY-MM (year and month only, without day)",
  inputSchema: z.object({
    cardName: z.string().optional(),
    financialInstitution: z.string().optional(),
    limit: z.number().optional(),
    dueDate: z.string().optional(),
  }),

  execute: async ({
    cardName = "",
    financialInstitution = "",
    limit = 0,
    dueDate = "",
  }) => {
    return {
      cardName,
      financialInstitution,
      limit,
      dueDate,
    };
  },
});

export const deleteCreditCardTool = tool({
  description: "Excludes a credit card",
  inputSchema: z.object({
    cardName: z.string(),
    cardId: z.string(),
  }),

  execute: async ({ cardName, cardId }) => {
    return {
      cardName,
      cardId,
    };
  },
});

export const listCreditCardsTool = tool({
  description: "List the available credit cards",
  inputSchema: z.object({
    cardName: z.string().optional(),
  }),

  execute: async ({ cardName = "" }) => {
    const creditCards = creditCardsMock;

    return {
      cardName,
      creditCards,
      totalOfCreditCards: creditCards.length,
    };
  },
});

export const listCreditCardActionsTool = tool({
  description: "List the available actions for credit cards",
  inputSchema: z.object({}),

  execute: async () => {
    return "Credit cards available list";
  },
});

export const createNewAccountTool = tool({
  description: "Create or add a new account to user",
  inputSchema: z.object({
    name: z.string(),
    financialInstitution: z.string(),
    balance: z.number(),
  }),

  execute: async ({ name, financialInstitution, balance }) => {
    return {
      name,
      financialInstitution,
      balance,
    };
  },
});

export const editAccountTool = tool({
  description: "Edit an existing account",
  inputSchema: z.object({
    accountId: z.string().optional(),
    name: z.string().optional(),
    financialInstitution: z.string().optional(),
    balance: z.number().optional(),
  }),

  execute: async ({ accountId, name, financialInstitution, balance }) => {
    try {
      const sessionId = await getSessionId();
      if (!sessionId) {
        return {
          accountId: accountId ?? "",
          name: name ?? "",
          financialInstitution: financialInstitution ?? "",
          balance: balance ?? 0,
          error: {
            error: {
              status: 401,
              message: "Não foi possível obter a sessão do usuário.",
              resource: `accounts/${accountId}`,
            },
          },
        };
      }

      let account: AccountType | null = null;

      if (accountId) {
        const resp = await getAccountById(accountId, sessionId);

        if (isRequestError(resp)) {
          return {
            accountId,
            name: name ?? "",
            financialInstitution: financialInstitution ?? "",
            balance: balance ?? 0,
            error: resp,
          };
        }

        if (resp) {
          account = resp;
        }
      }

      if (!account && name && name.trim()) {
        const searchTerm = name.trim();
        const resp = await listAccountsPaginated(sessionId, { page: 1, size: 1 }, searchTerm);

        if (isRequestError(resp)) {
          return {
            accountId: accountId ?? "",
            name: name ?? "",
            financialInstitution: financialInstitution ?? "",
            balance: balance ?? 0,
            error: resp,
          };
        }

        const [bestMatch] = resp.data ?? [];
        if (!bestMatch) {
          return {
            accountId: accountId ?? "",
            name: name ?? "",
            financialInstitution: financialInstitution ?? "",
            balance: balance ?? 0,
            error: createRequestError(
              404,
              "Nenhuma conta encontrada para editar. Tente especificar melhor o nome.",
              "accounts/paginated"
            ),
          };
        }

        account = bestMatch;
      }

      if (account) {
        return {
          accountId: account.id,
          name: name ?? account.name,
          financialInstitution:
            financialInstitution ?? account.financialInstitution,
          balance: balance ?? account.balance,
          semanticalSearch: accountId ? undefined : name?.trim() ?? account.name,
        };
      }
      
      return {
        accountId: accountId ?? "",
        name: name ?? "",
        financialInstitution: financialInstitution ?? "",
        balance: balance ?? 0,
      };
    } catch (error) {
      if (isRequestError(error)) {
        return {
          accountId: accountId ?? "",
          name: name ?? "",
          financialInstitution: financialInstitution ?? "",
          balance: balance ?? 0,
          error,
        };
      }

      return {
        accountId: accountId ?? "",
        name: name ?? "",
        financialInstitution: financialInstitution ?? "",
        balance: balance ?? 0,
        error: isRequestError(error)
          ? error
          : {
              error: {
                status: 500,
                message: error instanceof Error ? error.message : "Unknown error",
                resource: `accounts/${accountId}`,
              },
            },
      };
    }
  },
});

export const deleteAccountTool = tool({
  description: "Excludes an account",
  inputSchema: z.object({
    accountId: z.string().optional(),
    name: z.string(),
    financialInstitution: z.string().optional(),
  }),

  execute: async ({ accountId, name, financialInstitution }) => {
    try {
      const sessionId = await getSessionId();

      if (!sessionId) {
        return {
          accountId: "",
          name,
          financialInstitution: financialInstitution ?? "",
          error: createRequestError(
            401,
            "Não foi possível obter a sessão do usuário.",
            "accounts/paginated"
          ),
        };
      }

      if (accountId) {
        const resp = await getAccountById(accountId, sessionId);
        if (isRequestError(resp)) {
          return {
            accountId,
            name,
            financialInstitution: financialInstitution ?? "",
            error: resp,
          };
        }

        if (resp) {
          return {
            accountId: resp.id,
            name: resp.name,
            financialInstitution: resp.financialInstitution,
            balance: resp.balance,
          };
        }
      }

      const searchTerm = `${name} ${financialInstitution ?? ""}`.trim();
      const resp = await listAccountsPaginated(sessionId, { page: 1, size: 5 }, searchTerm || undefined);

      if (isRequestError(resp)) {
        return {
          accountId: "",
          name,
          financialInstitution: financialInstitution ?? "",
          error: resp,
        };
      }

      const [bestMatch] = resp.data ?? [];

      if (!bestMatch) {
        return {
          accountId: "",
          name,
          financialInstitution: financialInstitution ?? "",
          error: createRequestError(
            404,
            "Nenhuma conta encontrada para deletar. Tente especificar melhor o nome ou a instituição.",
            "accounts/paginated"
          ),
        };
      }

      return {
        accountId: bestMatch.id,
        name: bestMatch.name,
        financialInstitution: bestMatch.financialInstitution,
        balance: bestMatch.balance,
        semanticalSearch: searchTerm,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao localizar conta.";
      return {
        accountId: accountId ?? "",
        name,
        financialInstitution: financialInstitution ?? "",
        error: createRequestError(500, message, "accounts/paginated"),
      };
    }
  },
});

export const listAccountActionsTool = tool({
  description: "List the available actions for accounts",
  inputSchema: z.object({}),

  execute: async () => {
    return "Accounts available list";
  },
});

export const listAccountsTool = tool({
  description: "List all available accounts.",
  inputSchema: z.object({
    name: z.string().optional(),
  }),

  execute: async ({ name = "" }) => {
    try {
      const sessionId = await getSessionId();

      if (!sessionId) {
        return {
          nickname: name,
          accounts: [],
          totalOfAccounts: 0,
          error: {
            error: {
              status: 401,
              message: "Não foi possível obter os dados do usuário.",
              resource: "accounts/paginated",
            },
          },
        };
      }

      const resp = await listAccountsPaginated(
        sessionId,
        { page: 1, size: 10 },
        name || undefined
      );

      if (isRequestError(resp)) {
        return {
          nickname: name,
          accounts: [],
          totalOfAccounts: 0,
          error: resp,
        };
      }

      return {
        nickname: name,
        accounts: resp.data,
        totalOfAccounts: resp.totalItems,
        currentPage: resp.currentPage,
        pageLimit: resp.pageLimit,
      };
    } catch (error) {
      const message =
        isRequestError(error)
          ? error.error.message
          : error instanceof Error
          ? error.message
          : "Unknown error";

      return {
        nickname: name,
        accounts: [],
        totalOfAccounts: 0,
        error: isRequestError(error)
          ? error
          : { error: { status: 500, message, resource: "accounts/paginated" } },
      };
    }
  },
});

export const filterAccountsTool = tool({
  description:
    "Filter accounts by specific criteria like account name or financial institution. Use this when user wants to filter or search for specific accounts with criteria.",
  inputSchema: z.object({
    name: z.string().optional(),
    financialInstitution: z.string().optional(),
  }),

  execute: async ({ name, financialInstitution }) => {
    try {
      const sessionId = await getSessionId();

      if (!sessionId) {
        return {
          nickname: name || "",
          accounts: [],
          totalOfAccounts: 0,
          error: {
            error: {
              status: 401,
              message: "Não foi possível obter os dados do usuário.",
              resource: "accounts/paginated",
            },
          },
        };
      }

      const semanticalSearchTerm = `${name ?? ""} ${financialInstitution ?? ""}`.trim() || undefined;
      const resp = await listAccountsPaginated(
        sessionId,
        { page: 1, size: 10 },
        semanticalSearchTerm
      );

      if (isRequestError(resp)) {
        return {
          nickname: name || "",
          accounts: [],
          totalOfAccounts: 0,
          error: resp,
        };
      }

      return {
        nickname: name || "",
        accounts: resp.data,
        totalOfAccounts: resp.totalItems,
        currentPage: resp.currentPage,
        pageLimit: resp.pageLimit,
      };
    } catch (error) {
      if (isRequestError(error)) {
        return {
          nickname: name || "",
          accounts: [],
          totalOfAccounts: 0,
          error,
        };
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        nickname: name || "",
        accounts: [],
        totalOfAccounts: 0,
        error: {
          error: {
            status: 500,
            message: errorMessage,
            resource: "accounts/paginated",
          },
        },
      };
    }
  },
});

// items
export const createNewItemTool = tool({
  description: `Create or add a new transaction (item) to user. Analyze the user's message and automatically determine:
  - If it's income (received money, salary, payment received) or expense (spent money, paid, bought)
  - Suggest the most appropriate category based on the context (e.g., "almoço" -> food category, "uber" -> transport)
  - Suggest the most appropriate account if mentioned or use default
  - Extract the transaction date from the message (default to today when missing) and convert it to ISO 8601 (YYYY-MM-DD)
  - Extract the amount from the message
  
  Examples:
  - "gastei 300 reais no almoço ontem" -> expense, food category, 300, yesterday's ISO date (e.g., 2024-04-03)
  - "recebi meu salário de 5000 dia 05" -> income, salary category, 5000, 2024-04-05
  - "paguei 150 de uber dia 12/04" -> expense, transport category, 150, 2024-04-12`,
  
  inputSchema: z.object({
    name: z.string().describe("Short name for the transaction (e.g., 'Almoço', 'Uber', 'Salário')"),
    description: z.string().describe("Detailed description extracted from user message"),
    amount: z.number().positive("Amount must be positive").describe("The monetary amount"),
    type: z.enum(["income", "expense"]).describe("Automatically determined: 'income' if received money, 'expense' if spent/paid"),
    date: z.string().describe("Transaction date converted to ISO 8601 (YYYY-MM-DD). Use today's date when the user did not specify"),
    suggestedCategoryName: z.string().optional().describe("Suggest category name based on context (e.g., 'Alimentação', 'Transporte', 'Salário')"),
    suggestedAccountName: z.string().optional().describe("Suggest account name if mentioned by user"),
  }),

  execute: async ({ name, description, amount, type, date, suggestedCategoryName, suggestedAccountName }) => {
    const today = new Date().toISOString().split("T")[0];
    const parsedDate = (() => {
      if (!date) {
        return today;
      }

      const timestamp = Date.parse(date);
      if (Number.isNaN(timestamp)) {
        return today;
      }

      return new Date(timestamp).toISOString().split("T")[0];
    })();
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

    const matchedCategory = findBestMatch(
      categories,
      suggestedCategoryName,
      (cat) => cat.name
    );
    const matchedAccount = findBestMatch(
      accounts,
      suggestedAccountName,
      (acc) => acc.name
    );

    return {
      name,
      description,
      amount,
      date: parsedDate,
      type,
      categoryId: matchedCategory.id,
      accountId: matchedAccount.id,
      suggestedCategoryName: matchedCategory.name,
      suggestedAccountName: matchedAccount.name,
      categories,
      matchConfidence: {
        category: matchedCategory.confidence,
        account: matchedAccount.confidence,
      },
    };
  },
});

export const editItemTool = tool({
  description: "Edit an existing transaction (item)",
  inputSchema: z.object({
    itemId: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    amount: z.number().optional(),
    date: z.string().optional(),
    type: z.enum(["income", "expense"]).optional(),
    categoryId: z.string().optional(),
    accountId: z.string().optional(),
  }),

  execute: async ({ itemId, name, description, amount, date, type, categoryId, accountId }) => {
    const today = new Date().toISOString().split("T")[0];
    const sessionId = await getSessionId();

    if (!sessionId) {
      return {
        itemId,
        name: name ?? "",
        description: description ?? "",
        amount: amount ?? 0,
        date: date ?? today,
        type: type ?? "expense",
        categoryId: categoryId ?? "",
        accountId: accountId ?? "",
        error: createRequestError(
          401,
          "Não foi possível obter a sessão do usuário.",
          `items/${itemId}`
        ),
      };
    }

    try {
      const resp = await getItemById(itemId, sessionId);

      if (isRequestError(resp)) {
        return {
          itemId,
          name: name ?? "",
          description: description ?? "",
          amount: amount ?? 0,
          date: date ?? today,
          type: type ?? "expense",
          categoryId: categoryId ?? "",
          accountId: accountId ?? "",
          error: resp,
        };
      }

      if (resp) {
        const item = resp;
        return {
          itemId: item.id,
          name: name ?? item.name,
          description: description ?? item.description,
          amount: amount ?? item.amount,
          date: date ?? item.date,
          type: type ?? item.type,
          categoryId: categoryId ?? item.categoryId,
          accountId: accountId ?? item.accountId,
        };
      }

      return {
        itemId,
        name: name ?? "",
        description: description ?? "",
        amount: amount ?? 0,
        date: date ?? today,
        type: type ?? "expense",
        categoryId: categoryId ?? "",
        accountId: accountId ?? "",
      };
    } catch (error) {
      return {
        itemId,
        name: name ?? "",
        description: description ?? "",
        amount: amount ?? 0,
        date: date ?? today,
        type: type ?? "expense",
        categoryId: categoryId ?? "",
        accountId: accountId ?? "",
        error: isRequestError(error)
          ? error
          : createRequestError(
              500,
              error instanceof Error ? error.message : "Unknown error",
              `items/${itemId}`
            ),
      };
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
    const today = new Date();
    const todayIso = today.toISOString().split("T")[0];
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

const filterGoalsByParams = (
  goals: GoalType[],
  filters: { title?: string; accountId?: string; status?: "achieved" | "pending" }
) => {
  let filtered = [...goals];

  if (filters.title && filters.title.trim()) {
    const query = filters.title.toLowerCase().trim();
    filtered = filtered.filter((goal) => goal.title.toLowerCase().includes(query));
  }

  if (filters.accountId && filters.accountId.trim()) {
    if (filters.accountId === "global") {
      filtered = filtered.filter((goal) => goal.accountId === null);
    } else {
      filtered = filtered.filter((goal) => goal.accountId === filters.accountId);
    }
  }

  if (filters.status === "achieved") {
    filtered = filtered.filter((goal) => goal.achieved);
  } else if (filters.status === "pending") {
    filtered = filtered.filter((goal) => !goal.achieved);
  }

  return filtered;
};

export const createNewGoalTool = tool({
  description: "Create or add a new financial goal",
  inputSchema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    accountId: z.string().optional(),
    targetAmount: z.number().optional(),
    deadline: z.string().optional(),
  }),
  execute: async ({ title = "", description = "", accountId = "", targetAmount = 0, deadline = "" }) => {
    const baseResponse = {
      title,
      description,
      accountId,
      targetAmount,
      deadline,
    };

    try {
      const sessionId = await getSessionId();

      if (!sessionId) {
        return {
          ...baseResponse,
          accounts: [],
          error: {
            error: {
              status: 401,
              message: "Não foi possível obter os dados do usuário.",
              resource: "accounts",
            },
          },
        };
      }

      const accountsResponse = await listAccounts(sessionId);

      if (isRequestError(accountsResponse)) {
        return {
          ...baseResponse,
          accounts: [],
          error: accountsResponse,
        };
      }

      const accounts = accountsResponse.map((account) => ({
        id: account.id,
        name: account.name,
        financialInstitution: account.financialInstitution,
      }));

      return {
        ...baseResponse,
        accounts,
      };
    } catch (error) {
      if (isRequestError(error)) {
        return {
          ...baseResponse,
          accounts: [],
          error,
        };
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      return {
        ...baseResponse,
        accounts: [],
        error: {
          error: {
            status: 500,
            message: errorMessage,
            resource: "accounts",
          },
        },
      };
    }
  },
});

export const editGoalTool = tool({
  description: "Edit an existing financial goal",
  inputSchema: z.object({
    goalId: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    accountId: z.string().optional(),
    targetAmount: z.number().optional(),
    deadline: z.string().optional(),
  }),
  execute: async ({ goalId, title, description, accountId, targetAmount, deadline }) => {
    try {
      const sessionId = await getSessionId();
      if (!sessionId) {
        return {
          goalId,
          title,
          description,
          accountId,
          targetAmount,
          deadline,
          accounts: [],
          error: {
            error: {
              status: 401,
              message: "Não foi possível obter os dados do usuário.",
              resource: `goals/${goalId}`,
            },
          },
        };
      }

      const goalResp = await getGoalById(goalId, sessionId);

      if (isRequestError(goalResp)) {
        return { goalId, title, description, accountId, targetAmount, deadline, accounts: [], error: goalResp };
      }

      const goal = goalResp;

      const baseGoalData = {
        goalId: goal.id,
        title: title ?? goal.title,
        description: description ?? goal.description,
        accountId: accountId ?? goal.accountId,
        targetAmount: targetAmount ?? goal.targetAmount,
        deadline: deadline ?? goal.deadline,
      };

      const accountsResp = await listAccounts(sessionId);

      if (isRequestError(accountsResp)) {
        return {
          ...baseGoalData,
          accounts: [],
          error: accountsResp,
        };
      }

      const accounts = accountsResp.map((acc) => ({
        id: acc.id,
        name: acc.name,
        financialInstitution: acc.financialInstitution,
      }));

      return {
        ...baseGoalData,
        accounts,
      };
    } catch (error) {
      return {
        goalId,
        title,
        description,
        accountId,
        targetAmount,
        deadline,
        accounts: [],
        error: {
          error: {
            status: 500,
            message: error instanceof Error ? error.message : "Erro desconhecido",
            resource: `goals/${goalId}`,
          },
        },
      };
    }
  },
});

export const deleteGoalTool = tool({
  description: "Delete an existing goal",
  inputSchema: z.object({
    goalId: z.string(),
  }),
  execute: async ({ goalId }) => {
    try {
      const sessionId = await getSessionId();
      if (!sessionId) {
        return {
          goalId,
          error: {
            error: {
              status: 401,
              message: "Não foi possível obter os dados do usuário.",
              resource: `goals/${goalId}`,
            },
          },
        };
      }

      const goalResp = await getGoalById(goalId, sessionId);

      if (isRequestError(goalResp)) {
        return { goalId, error: goalResp };
      }

      return {
        goalId: goalResp.id,
        title: goalResp.title,
        targetAmount: goalResp.targetAmount,
        currentAmount: goalResp.currentAmount,
        achieved: goalResp.achieved,
        deadline: goalResp.deadline,
      };
    } catch (error) {
      return {
        goalId,
        error: {
          error: {
            status: 500,
            message: error instanceof Error ? error.message : "Erro desconhecido",
            resource: `goals/${goalId}`,
          },
        },
      };
    }
  },
});

export const listGoalActionsTool = tool({
  description: "List the possible actions related to goals",
  inputSchema: z.object({}),
  execute: async () => {
    return "Goals available list";
  },
});

export const listGoalsTool = tool({
  description: "List all financial goals for the authenticated user",
  inputSchema: z.object({
    title: z.string().optional(),
    accountId: z.string().optional(),
    status: z.enum(["achieved", "pending"]).optional(),
  }),
  execute: async ({ title = "", accountId = "", status }) => {
    try {
      const sessionId = await getSessionId();

      if (!sessionId) {
        return {
          title,
          accountId,
          status,
          goals: [],
          totalOfGoals: 0,
          error: {
            error: {
              status: 401,
              message: "Não foi possível obter os dados do usuário.",
              resource: "goals",
            },
          },
        };
      }

      const resp = await listGoals(sessionId);

      if (isRequestError(resp)) {
        return {
          title,
          accountId,
          status,
          goals: [],
          totalOfGoals: 0,
          error: resp,
        };
      }

      const filteredGoals = filterGoalsByParams(resp, {
        title,
        accountId,
        status,
      });

      return {
        title,
        accountId,
        status,
        goals: filteredGoals,
        totalOfGoals: filteredGoals.length,
        currentPage: 1,
        pageLimit: filteredGoals.length || 10,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return {
        title,
        accountId,
        status,
        goals: [],
        totalOfGoals: 0,
        error: {
          error: {
            status: 500,
            message,
            resource: "goals",
          },
        },
      };
    }
  },
});


export const tools = {
  createNewCategory: createNewCategoryTool,
  editCategory: editCategoryTool,
  listCategoryActions: listCategoryActionsTool,
  deleteCategory: deleteCategoryTool,
  listCategories: listCategoriesTool,

  createNewAccount: createNewAccountTool,
  editAccount: editAccountTool,
  listAccountActions: listAccountActionsTool,
  deleteAccount: deleteAccountTool,
  listAccounts: listAccountsTool,
  filterAccounts: filterAccountsTool,

  createNewCreditCard: createNewCreditCardTool,
  listCreditCardActions: listCreditCardActionsTool,
  deleteCreditCard: deleteCreditCardTool,
  listCreditCards: listCreditCardsTool,

  createNewItem: createNewItemTool,
  editItem: editItemTool,
  listItemActions: listItemActionsTool,
  deleteItem: deleteItemTool,
  listItems: listItemsTool,

  createNewGoal: createNewGoalTool,
  editGoal: editGoalTool,
  listGoalActions: listGoalActionsTool,
  deleteGoal: deleteGoalTool,
  listGoals: listGoalsTool,
};
