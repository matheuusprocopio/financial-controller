import { creditCardsMock } from "@/data/creditCardsMock";
import { tool } from "ai";
import { z } from "zod";
import { listCategories } from "@/utils/services/categories";
import { listAccounts, getAccountById } from "@/utils/services/accounts";
import { listItems, getItemById } from "@/utils/services/items";
import { findBestMatch } from "@/utils/fuzzySearch";

const ensureErrorMessage = (rawMessage?: string) => {
  if (!rawMessage) return "Unknown error";

  try {
    const parsed = JSON.parse(rawMessage);

    if (parsed && typeof parsed === "object" && "message" in parsed) {
      const extracted = (parsed as { message?: unknown }).message;

      if (typeof extracted === "string" && extracted.trim()) return extracted;
    }
  } catch (err) {
    // ignore parse failures and use raw message
  }

  return rawMessage;
};

// categories
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
      const resp = await listCategories("7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e", name);

      if (Array.isArray(resp)) {
        const categories = resp;

        return {
          name,
          categories,
          totalOfCategories: categories.length,
        };
      }

      const { error } = resp;

      return {
        name,
        categories: [],
        totalOfCategories: 0,
        error: ensureErrorMessage(error.message),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      return {
        name,
        categories: [],
        totalOfCategories: 0,
        error: errorMessage,
        status: null,
        resource: null,
      };
    }
  },
});
//




// credit card
export const createNewCreditCardTool = tool({
  description: "Create or add a new credit card to user. The dueDate should be in format YYYY-MM (year and month only, without day)",
  inputSchema: z.object({
    cardName: z.string().optional(),
    financialInstitution: z.string().optional(),
    limit: z.number().optional(),
    dueDate: z.string().optional(),
  }),

  execute: async ({ cardName = "", financialInstitution = "", limit = 0, dueDate = "" }) => {
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
//


// accounts
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
      const resp = await getAccountById(accountId);

      if (resp && !resp.error) {
        const account = resp;
        return {
          accountId: account.id,
          name: name ?? account.nickname,
          financialInstitution: financialInstitution ?? account.financial_institution,
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
      return {
        accountId,
        name: name ?? "",
        financialInstitution: financialInstitution ?? "",
        balance: balance ?? 0,
        error: error instanceof Error ? error.message : "Unknown error",
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
      const resp = await listAccounts("7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e");

      if (Array.isArray(resp)) {
        const accounts = resp;

        const filteredAccounts = name
          ? accounts.filter((account) =>
              account.nickname.toLowerCase().includes(name.toLowerCase())
            )
          : accounts;

        return {
          name,
          accounts: filteredAccounts,
          totalOfAccounts: filteredAccounts.length,
        };
      }

      const { error } = resp;

      return {
        name,
        accounts: [],
        totalOfAccounts: 0,
        error: ensureErrorMessage(error.message),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      return {
        name,
        accounts: [],
        totalOfAccounts: 0,
        error: errorMessage,
        status: null,
        resource: null,
      };
    }
  },
});

export const filterAccountsTool = tool({
  description: "Filter accounts by specific criteria like account name or financial institution. Use this when user wants to filter or search for specific accounts with criteria.",
  inputSchema: z.object({
    name: z.string().optional(),
    financialInstitution: z.string().optional(),
  }),

  execute: async ({ name, financialInstitution }) => {
    try {
      const resp = await listAccounts("7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e");

      if (Array.isArray(resp)) {
        let filteredAccounts = [...resp];

        if (name && name.trim()) {
          const nameFilter = name.toLowerCase().trim();
          filteredAccounts = filteredAccounts.filter((account) =>
            account.nickname.toLowerCase().includes(nameFilter)
          );
        }

        if (financialInstitution && financialInstitution.trim()) {
          const institutionFilter = financialInstitution.toLowerCase().trim();
          filteredAccounts = filteredAccounts.filter((account) =>
            account.financial_institution.toLowerCase().includes(institutionFilter)
          );
        }

        return {
          name: name || "",
          financialInstitution: financialInstitution || "",
          accounts: filteredAccounts,
          totalOfAccounts: filteredAccounts.length,
          totalOfOriginalAccounts: resp.length,
        };
      }

      const { error } = resp;

      return {
        name: name || "",
        financialInstitution: financialInstitution || "",
        accounts: [],
        totalOfAccounts: 0,
        totalOfOriginalAccounts: 0,
        error: ensureErrorMessage(error.message),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      return {
        name: name || "",
        financialInstitution: financialInstitution || "",
        accounts: [],
        totalOfAccounts: 0,
        totalOfOriginalAccounts: 0,
        error: errorMessage,
      };
    }
  },
});
//


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
    try {
      const [categoriesResp, accountsResp] = await Promise.all([
        listCategories("7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e"),
        listAccounts("7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e"),
      ]);

      if (!Array.isArray(categoriesResp) || categoriesResp.length === 0) {
        return {
          name,
          description,
          amount,
          date: new Date().toISOString().split("T")[0],
          type,
          categoryId: "",
          accountId: "",
          error: "No categories available. Please create a category first.",
          suggestedCategoryName,
          suggestedAccountName,
        };
      }

      if (!Array.isArray(accountsResp) || accountsResp.length === 0) {
        return {
          name,
          description,
          amount,
          date: new Date().toISOString().split("T")[0],
          type,
          categoryId: "",
          accountId: "",
          error: "No accounts available. Please create an account first.",
          suggestedCategoryName,
          suggestedAccountName,
        };
      }

      const matchedCategory = findBestMatch(
        categoriesResp,
        suggestedCategoryName,
        (cat) => cat.name
      );
      const matchedAccount = findBestMatch(
        accountsResp,
        suggestedAccountName,
        (acc) => acc.nickname
      );

      const currentDate = new Date().toISOString().split("T")[0];

      return {
        name,
        description,
        amount,
        date: currentDate,
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        name,
        description,
        amount,
        date: new Date().toISOString().split("T")[0],
        type,
        categoryId: "",
        accountId: "",
        error: errorMessage,
        suggestedCategoryName,
        suggestedAccountName,
      };
    }
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
    try {
      const resp = await getItemById(itemId);

      if (resp && !("error" in resp)) {
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
        date: date ?? new Date().toISOString().split("T")[0],
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
        date: date ?? new Date().toISOString().split("T")[0],
        type: type ?? "expense",
        categoryId: categoryId ?? "",
        accountId: accountId ?? "",
        error: error instanceof Error ? error.message : "Unknown error",
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
    try {
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

      const resp = await listItems("7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e", {
        name: name || undefined,
        startDate: finalStartDate,
        endDate: finalEndDate,
        type: type || undefined,
        page,
        pageLimit,
      });

      if (resp && !("error" in resp)) {
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
      }

      const error = "error" in resp ? resp.error : { message: "Unknown error" };

      return {
        name,
        startDate: finalStartDate,
        endDate: finalEndDate,
        type: type || "all",
        data: [],
        totalItems: 0,
        error: ensureErrorMessage(error.message),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      return {
        name,
        data: [],
        totalItems: 0,
        error: errorMessage,
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
  listItems: listItemsTool
};
