import { creditCardsMock } from "@/data/creditCardsMock";
import { tool } from "ai";
import { z } from "zod";
import { listCategories } from "@/utils/services/categories";
import { listAccounts, getAccountById } from "@/utils/services/accounts";

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
};
