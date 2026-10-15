import { tool } from "ai";
import { z } from "zod";

import { listCategoriesPaginated } from "@/utils/services/categories";
import { listAccountsPaginated, getAccountById, listAccounts } from "@/utils/services/accounts";
import { listGoals, getGoalById } from "@/utils/services/goals";
import { listItems, getItemById } from "@/utils/services/items";
import { getSessionId } from "@/utils/server-cookies";
import { findBestMatch } from "@/utils/fuzzySearch";
import { getLocalIsoDate } from "@/utils/date";
import type { FuzzyMatchResult } from "@/utils/fuzzySearch";
import { calculateItemsAnalytics, ItemAnalyticsRequest } from "@/utils/services/Analytics/itemsAnalytics";
import { ItemAnalyticsResponse } from "@/types/analytics.types";
import { ItemType } from "@/types/item.type";

import { AccountType } from "@/types/account.type";
import { GoalType } from "@/types/goal.types";
import { RequestError, createRequestError } from "@/utils/requestProvider";

const isRequestError = (resp: unknown): resp is RequestError => {
  return !!resp && typeof resp === "object" && "error" in (resp as Record<string, unknown>);
};

const getTodayIsoDate = () => getLocalIsoDate();

const MIN_MATCH_CONFIDENCE = 0.5;

const resolveIsoDate = (value?: string | null, fallback?: string | null) => {
  const candidates = [value, fallback];
  let firstTrimmed: string | undefined;

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();

    if (!trimmed) {
      continue;
    }

    if (!firstTrimmed) {
      firstTrimmed = trimmed;
    }

    const timestamp = Date.parse(trimmed);

    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp).toISOString().split("T")[0];
    }
  }

  if (firstTrimmed) {
    return firstTrimmed;
  }

  return getTodayIsoDate();
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
    return {
      cardName,
      creditCards: [],
      totalOfCreditCards: 0,
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

export const itemsAnalyticsTool = tool({
  description: `
    Calcula métricas financeiras com base nos lançamentos (items) do usuário.
    Use este tool sempre que o usuário pedir gráficos, relatórios ou comparações
    envolvendo tempo (meses) e categorias/contas/tipos.

    Prefira usar:
    - metric: "total_expenses" para gráficos de gastos
    - groupBy: ["month","category"] para evolução mensal por categoria
  `,
  inputSchema: z.object({
    metric: z
      .enum(["total_expenses", "total_incomes", "balance", "count_items"])
      .describe("Qual métrica calcular."),
    groupBy: z
      .array(z.enum(["month", "category", "account", "type"]))
      .min(1)
      .max(2)
      .describe("Dimensões para agrupar os dados."),
    startDate: z
      .string()
      .describe("Data inicial no formato YYYY-MM-DD"),
    endDate: z
      .string()
      .describe("Data final no formato YYYY-MM-DD"),
    categoryId: z.string().optional(),
    accountId: z.string().optional(),
  }),

  execute: async (input) => {
    const sessionId = await getSessionId();
    
    if (!sessionId) {
      return {
        metric: input.metric,
        groupBy: input.groupBy,
        points: [],
        error: createRequestError(
          401,
          "Não foi possível obter a sessão do usuário.",
          "items/analytics"
        ),
      };
    }

    const normalizedGroupBy = (() => {
      const hasMonth = input.groupBy.includes("month");
      const hasCategory = input.groupBy.includes("category");
      if (hasMonth && hasCategory) {
        return input.groupBy;
      }
      return ["month", "category"] as ItemAnalyticsRequest["groupBy"];
    })();

    const body: ItemAnalyticsRequest = {
      metric: input.metric,
      groupBy: normalizedGroupBy,
      startDate: input.startDate,
      endDate: input.endDate,
      categoryId: input.categoryId,
      accountId: input.accountId,
    };

    try {
      console.info("[itemsAnalyticsTool] Fetching analytics", {
        metric: body.metric,
        groupBy: body.groupBy,
        startDate: body.startDate,
        endDate: body.endDate,
        hasCategoryFilter: Boolean(body.categoryId),
        hasAccountFilter: Boolean(body.accountId),
      });
      const resp = await calculateItemsAnalytics(body, sessionId);

      if (isRequestError(resp)) {
        console.error("[itemsAnalyticsTool] Backend error", resp.error);
        return {
          metric: input.metric,
          groupBy: normalizedGroupBy,
          points: [],
          error: resp,
        } satisfies ItemAnalyticsResponse;
      }

      console.info("[itemsAnalyticsTool] Received analytics", {
        points: resp.points.length,
        metric: resp.metric,
        groupBy: resp.groupBy,
      });

      return resp;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      console.error("[itemsAnalyticsTool] Unexpected failure", message);
      return {
        metric: input.metric,
        groupBy: normalizedGroupBy,
        points: [],
        error: createRequestError(500, message, "items/analytics"),
      } satisfies ItemAnalyticsResponse;
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

export const updateUserTool = tool({
  description: "Update Authenticated User data",
  inputSchema: z.object({
    userId: z.string().optional(),
    name: z.string().optional()
  }),

  execute: async ({ userId = "", name = ""}) => {
    return {
      userId,
      name

    };
  },
});

export const deleteUserTool = tool({
  description: "Delete Authenticated User",
  inputSchema: z.object({
    userId: z.string().optional(),
    name: z.string().optional(),
  }),

  execute: async ({ userId = "", name = ""}) => {
    return {
      userId,
      name
    };
  },
});


const filterGoalsByParams = (
  goals: GoalType[],
  filters: { title?: string; accountId?: string; status?: "achieved" | "pending" },
  options?: { skipTitleFilter?: boolean }
) => {
  let filtered = [...goals];

  if (!options?.skipTitleFilter && filters.title && filters.title.trim()) {
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
    const normalizedDeadline = resolveIsoDate(deadline);
    const baseResponse = {
      title,
      description,
      accountId,
      targetAmount,
      deadline: normalizedDeadline,
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
    goalId: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    accountId: z.string().optional(),
    targetAmount: z.number().optional(),
    deadline: z.string().optional(),
  }),
  execute: async ({ goalId, title, description, accountId, targetAmount, deadline }) => {
    const computeDeadline = (goalDeadline?: string | null) => resolveIsoDate(deadline, goalDeadline);

    try {
      const sessionId = await getSessionId();
      if (!sessionId) {
        return {
          goalId,
          title,
          description,
          accountId,
          targetAmount,
          deadline: computeDeadline(),
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

      let goal: GoalType | null = null;

      if (goalId) {
        const goalResp = await getGoalById(goalId, sessionId);

        if (isRequestError(goalResp)) {
          return {
            goalId,
            title,
            description,
            accountId,
            targetAmount,
            deadline: computeDeadline(),
            accounts: [],
            error: goalResp,
          };
        }

        goal = goalResp;
      }

      if (!goal && title && title.trim()) {
        const goalResp = await listGoals(sessionId, title);
        if (isRequestError(goalResp)) {
          return {
            goalId,
            title,
            description,
            accountId,
            targetAmount,
            deadline: computeDeadline(),
            accounts: [],
            error: goalResp,
          };
        }

        const [bestMatch] = goalResp;
        if (!bestMatch) {
          return {
            goalId: goalId ?? "",
            title: title ?? "",
            description,
            accountId,
            targetAmount,
            deadline: computeDeadline(),
            accounts: [],
            error: createRequestError(
              404,
              "Nenhuma meta encontrada para editar. Tente especificar melhor o título.",
              "goals"
            ),
          };
        }

        goal = bestMatch;
      }

      if (!goal) {
        return {
          goalId: goalId ?? "",
          title: title ?? "",
          description,
          accountId,
          targetAmount,
          deadline: computeDeadline(),
          accounts: [],
          error: createRequestError(404, "Meta não encontrada.", "goals"),
        };
      }

      const baseGoalData = {
        goalId: goal.id,
        title: title ?? goal.title,
        description: description ?? goal.description,
        accountId: accountId ?? goal.accountId,
        targetAmount: targetAmount ?? goal.targetAmount,
        deadline: computeDeadline(goal.deadline),
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
        semanticalSearch: goalId ? undefined : title?.trim() ?? goal.title,
      };
    } catch (error) {
      return {
        goalId,
        title,
        description,
        accountId,
        targetAmount,
        deadline: computeDeadline(),
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
    goalId: z.string().optional(),
    title: z.string(),
  }),
  execute: async ({ goalId, title }) => {
    try {
      const sessionId = await getSessionId();
      if (!sessionId) {
        return {
          goalId: goalId ?? "",
          title,
          error: {
            error: {
              status: 401,
              message: "Não foi possível obter os dados do usuário.",
              resource: `goals/${goalId ?? ""}`,
            },
          },
        };
      }

      if (goalId) {
        const goalResp = await getGoalById(goalId, sessionId);

        if (isRequestError(goalResp)) {
          return { goalId, title, error: goalResp };
        }

        return {
          goalId: goalResp.id,
          title: goalResp.title,
          targetAmount: goalResp.targetAmount,
          currentAmount: goalResp.currentAmount,
          achieved: goalResp.achieved,
          deadline: goalResp.deadline,
        };
      }

      const searchTerm = title.trim();
      const goalsResp = await listGoals(sessionId, searchTerm);

      if (isRequestError(goalsResp)) {
        return { goalId: goalId ?? "", title, error: goalsResp };
      }

      const [bestMatch] = goalsResp ?? [];

      if (!bestMatch) {
        return {
          goalId: goalId ?? "",
          title,
          error: createRequestError(
            404,
            "Nenhuma meta encontrada para deletar. Tente especificar melhor o título.",
            "goals"
          ),
        };
      }

      return {
        goalId: bestMatch.id,
        title: bestMatch.title,
        targetAmount: bestMatch.targetAmount,
        currentAmount: bestMatch.currentAmount,
        achieved: bestMatch.achieved,
        deadline: bestMatch.deadline,
        semanticalSearch: searchTerm,
      };
    } catch (error) {
      return {
        goalId: goalId ?? "",
        title,
        error: {
          error: {
            status: 500,
            message: error instanceof Error ? error.message : "Erro desconhecido",
            resource: `goals/${goalId ?? ""}`,
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
    const trimmedAccountId = accountId.trim();
    const accountFilterValue =
      trimmedAccountId.length > 0 ? trimmedAccountId : undefined;

    try {
      const sessionId = await getSessionId();

      if (!sessionId) {
        return {
          title,
          accountId: accountFilterValue,
          status: status ?? "all",
          goals: [],
          totalOfGoals: 0,
          accounts: [],
          error: {
            error: {
              status: 401,
              message: "Não foi possível obter os dados do usuário.",
              resource: "goals",
            },
          },
        };
      }

      const semanticalSearch = title.trim() ? title.trim() : undefined;
      const [goalsResponse, accountsResponse] = await Promise.all([
        listGoals(sessionId, semanticalSearch),
        listAccounts(sessionId),
      ]);

      const accounts = isRequestError(accountsResponse)
        ? []
        : accountsResponse.map((account) => ({
            id: account.id,
            name: account.name,
            financialInstitution: account.financialInstitution,
          }));

      if (isRequestError(goalsResponse)) {
        return {
          title,
          accountId: accountFilterValue,
          status: status ?? "all",
          goals: [],
          totalOfGoals: 0,
          accounts,
          error: goalsResponse,
        };
      }

      const filteredGoals = filterGoalsByParams(
        goalsResponse,
        {
          title,
          accountId: accountFilterValue,
          status,
        },
        { skipTitleFilter: !!semanticalSearch }
      );

      return {
        title,
        accountId: accountFilterValue,
        status: status ?? "all",
        goals: filteredGoals,
        totalOfGoals: filteredGoals.length,
        currentPage: 1,
        pageLimit: filteredGoals.length || 10,
        accounts,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return {
        title,
        accountId: accountFilterValue,
        status: status ?? "all",
        goals: [],
        totalOfGoals: 0,
        accounts: [],
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

  itemsAnalytics: itemsAnalyticsTool,

  createNewItem: createNewItemTool,
  editItem: editItemTool,
  listItemActions: listItemActionsTool,
  deleteItem: deleteItemTool,
  listItems: listItemsTool,

  updateUser: updateUserTool,
  deleteUser: deleteUserTool,

  createNewGoal: createNewGoalTool,
  editGoal: editGoalTool,
  listGoalActions: listGoalActionsTool,
  deleteGoal: deleteGoalTool,
  listGoals: listGoalsTool,
};
