import { creditCardsMock } from "@/data/creditCardsMock";
import { tool } from "ai";
import { z } from "zod";

import { listCategoriesPaginated } from "@/utils/services/categories";
import { listAccountsPaginated, getAccountById } from "@/utils/services/accounts";
import { listItems, getItemById } from "@/utils/services/items";
import { getSessionId } from "@/utils/server-cookies";
import { findBestMatch } from "@/utils/fuzzySearch";

import { AccountType } from "@/types/account.type";
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
    categoryId: z.string(),
    name: z.string(),
  }),

  execute: async ({ categoryId, name }) => {
    return {
      categoryId,
      name,
    };
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

      const resp = await listCategoriesPaginated(
        sessionId,
        { page: 1, size: 10 },
        name
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
    accountId: z.string(),
    name: z.string().optional(),
    financialInstitution: z.string().optional(),
    balance: z.number().optional(),
  }),

  execute: async ({ accountId, name, financialInstitution, balance }) => {
    try {
      const sessionId = await getSessionId();
      if (!sessionId) {
        return {
          accountId,
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
        const account = resp;
        return {
          accountId: account.id,
          name: name ?? account.name,
          financialInstitution:
            financialInstitution ?? account.financialInstitution,
          balance: balance ?? account.balance,
        };
      }

      return {
        accountId,
        name: name ?? "",
        financialInstitution: financialInstitution ?? "",
        balance: balance ?? 0,
      };
    } catch (error) {
      if (isRequestError(error)) {
        return {
          accountId,
          name: name ?? "",
          financialInstitution: financialInstitution ?? "",
          balance: balance ?? 0,
          error,
        };
      }

      return {
        accountId,
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
    accountId: z.string(),
    name: z.string(),
    financialInstitution: z.string(),
  }),

  execute: async ({ accountId, name, financialInstitution }) => {
    return {
      accountId,
      name,
      financialInstitution,
    };
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

      const resp = await listAccountsPaginated(sessionId, { page: 1, size: 10 });

      if (isRequestError(resp)) {
        return {
          nickname: name,
          accounts: [],
          totalOfAccounts: 0,
          error: resp,
        };
      }

      const filteredAccounts = name
        ? resp.data.filter((account: AccountType) =>
            account.name.toLowerCase().includes(name.toLowerCase())
          )
        : resp.data;

      return {
        nickname: name,
        accounts: filteredAccounts,
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

      const resp = await listAccountsPaginated(sessionId, { page: 1, size: 10 });

      if (isRequestError(resp)) {
        return {
          nickname: name || "",
          accounts: [],
          totalOfAccounts: 0,
          error: resp,
        };
      }

      let filteredAccounts = [...resp.data];

      if (name && name.trim()) {
        const nameFilter = name.toLowerCase().trim();
        filteredAccounts = filteredAccounts.filter((account: AccountType) =>
          account.name.toLowerCase().includes(nameFilter)
        );
      }

      if (financialInstitution && financialInstitution.trim()) {
        const institutionFilter = financialInstitution.toLowerCase().trim();
        filteredAccounts = filteredAccounts.filter((account: AccountType) =>
          account.financialInstitution
            .toLowerCase()
            .includes(institutionFilter)
        );
      }

      return {
        nickname: name || "",
        accounts: filteredAccounts,
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
  - Use current date/time unless user specifies otherwise
  - Extract the amount from the message
  
  Examples:
  - "gastei 300 reais no almoço" -> expense, food category, 300, today
  - "recebi meu salário de 5000" -> income, salary category, 5000, today
  - "paguei 150 de uber" -> expense, transport category, 150, today`,
  
  inputSchema: z.object({
    name: z.string().describe("Short name for the transaction (e.g., 'Almoço', 'Uber', 'Salário')"),
    description: z.string().describe("Detailed description extracted from user message"),
    amount: z.number().positive("Amount must be positive").describe("The monetary amount"),
    type: z.enum(["income", "expense"]).describe("Automatically determined: 'income' if received money, 'expense' if spent/paid"),
    suggestedCategoryName: z.string().optional().describe("Suggest category name based on context (e.g., 'Alimentação', 'Transporte', 'Salário')"),
    suggestedAccountName: z.string().optional().describe("Suggest account name if mentioned by user"),
  }),

  execute: async ({ name, description, amount, type, suggestedCategoryName, suggestedAccountName }) => {
    const today = new Date().toISOString().split("T")[0];
    const sessionId = await getSessionId();

    if (!sessionId) {
      return {
        name,
        description,
        amount,
        date: today,
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

    const [categoriesResp, accountsResp] = await Promise.all([
      listCategoriesPaginated(sessionId, { page: 1, size: 10 }),
      listAccountsPaginated(sessionId, { page: 1, size: 10 }),
    ]);

    if (isRequestError(categoriesResp)) {
      return {
        name,
        description,
        amount,
        date: today,
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
        date: today,
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
        date: today,
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
        date: today,
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
      date: today,
      type,
      categoryId: matchedCategory.id,
      accountId: matchedAccount.id,
      suggestedCategoryName: matchedCategory.name,
      suggestedAccountName: matchedAccount.name,
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

export const listItemsTool = tool({
  description: `List all transactions (items) for the user with flexible date filtering.
  
  The AI should intelligently interpret user queries and set appropriate date ranges:
  - "gastos do mês passado" / "last month" -> first day to last day of previous month
  - "janeiro de 2024" / "January 2024" -> 2024-01-01 to 2024-01-31
  - "este ano" / "this year" -> 2025-01-01 to today
  - "últimos 30 dias" / "last 30 days" -> 30 days ago to today
  - "semana passada" / "last week" -> first day to last day of previous week
  - No date specified -> last 30 days (default)
  
  Can also be filtered by name/description and transaction type.`,
  
  inputSchema: z.object({
    name: z.string().optional().describe("Filter by transaction name or description"),
    startDate: z.string().optional().describe("Start date in YYYY-MM-DD format. AI should calculate based on user query."),
    endDate: z.string().optional().describe("End date in YYYY-MM-DD format. AI should calculate based on user query. Defaults to today if not specified."),
    type: z.enum(["income", "expense"]).optional().describe("Filter by transaction type: 'income' for received money, 'expense' for spent money"),
    page: z.number().optional(),
    pageLimit: z.number().optional(),
  }),

  execute: async ({ name = "", startDate, endDate, type, page, pageLimit }) => {
    const today = new Date();
    let finalStartDate: string;
    let finalEndDate: string;
    
    if (!startDate && !endDate) {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      finalStartDate = thirtyDaysAgo.toISOString().split("T")[0];
      finalEndDate = today.toISOString().split("T")[0];
    } else {
      finalStartDate = startDate || new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
      finalEndDate = endDate || today.toISOString().split("T")[0];
    }

    const sessionId = await getSessionId();

    if (!sessionId) {
      return {
        name,
        startDate: finalStartDate,
        endDate: finalEndDate,
        type: type || "all",
        data: [],
        totalItems: 0,
        error: createRequestError(
          401,
          "Não foi possível obter a sessão do usuário.",
          "items"
        ),
      };
    }

    try {
      const resp = await listItems(sessionId, {
        name: name || undefined,
        startDate: finalStartDate,
        endDate: finalEndDate,
        type: type || undefined,
        page,
        pageLimit,
      });

      if (isRequestError(resp)) {
        return {
          name,
          startDate: finalStartDate,
          endDate: finalEndDate,
          type: type || "all",
          data: [],
          totalItems: 0,
          error: resp,
        };
      }

      return {
        name,
        startDate: finalStartDate,
        endDate: finalEndDate,
        type: type || "all",
        data: resp.data,
        totalItems: resp.totalItems,
        currentPage: resp.currentPage,
        pageLimit: resp.pageLimit,
      };
    } catch (error) {
      return {
        name,
        data: [],
        totalItems: 0,
        error: isRequestError(error)
          ? error
          : createRequestError(
              500,
              error instanceof Error ? error.message : "Unknown error",
              "items"
            ),
      };
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
};
