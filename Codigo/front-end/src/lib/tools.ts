import { categoriesMock } from "@/data/categoriesMock";
import { creditCardsMock } from "@/data/creditCardsMock";
import { accountsMock } from "@/data/accountsMock";
import { tool } from "ai";
import { z } from "zod";

export const createNewCategoryTool = tool({
  description: "Create or add a new category or sub-category to user",
  inputSchema: z.object({
    name: z.string().optional(),
  }),

  execute: async ({ name = "" }) => {
    return {
      name,
    };
  },
});

export const deleteCategoryTool = tool({
  description: "Excludes a category or sub-category",
  inputSchema: z.object({
    name: z.string(),
  }),

  execute: async ({ name }) => {
    return {
      name,
    };
  },
});

export const listCategoryActionsTool = tool({
  description: "List the available actions for categories",
  inputSchema: z.object({}),

  execute: async () => {
    return "Categories avaliable list";
  },
});

export const listCategoriesTool = tool({
  description: "List the available categories",
  inputSchema: z.object({
    name: z.string().optional(),
  }),

  execute: async ({ name = "" }) => {
    const categories = categoriesMock;

    return {
      name,
      categories,
      totalOfCategories: categories.length,
    };
  },
});




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

export const createNewAccountTool = tool({
  description: "Create or add a new account to user",
  inputSchema: z.object({
    nickname: z.string(),
    financial_institution: z.string(),
    balance: z.number(),
  }),

  execute: async ({ nickname, financial_institution, balance }) => {
    return {
      nickname,
      financial_institution,
      balance,
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

export const deleteAccountTool = tool({
  description: "Excludes an account",
  inputSchema: z.object({
    nickname: z.string(),
    financial_institution: z.string()
  }),

  execute: async ({ nickname, financial_institution }) => {
    return {
      nickname,
      financial_institution
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
    nickname: z.string().optional(),
  }),

  execute: async ({ nickname }) => {
    const accounts = accountsMock;

    return {
      nickname: nickname || "",
      accounts,
      totalOfAccounts: accounts.length,
    };
  },
});

export const filterAccountsTool = tool({
  description: "Filter accounts by specific criteria like account name or financial institution. Use this when user wants to filter or search for specific accounts with criteria.",
  inputSchema: z.object({
    nickname: z.string().optional(),
    financial_institution: z.string().optional(),
  }),

  execute: async ({ nickname, financial_institution }) => {
    let filteredAccounts = [...accountsMock];

    if (nickname && nickname.trim()) {
      const nicknameFilter = nickname.toLowerCase().trim();
      filteredAccounts = filteredAccounts.filter(account =>
        account.nickname.toLowerCase().includes(nicknameFilter)
      );
    }

    if (financial_institution && financial_institution.trim()) {
      const institutionFilter = financial_institution.toLowerCase().trim();
      filteredAccounts = filteredAccounts.filter(account =>
        account.financial_institution.toLowerCase().includes(institutionFilter)
      );
    }

    return {
      nickname: nickname || "",
      financial_institution: financial_institution || "",
      accounts: filteredAccounts,
      totalOfAccounts: filteredAccounts.length,
      totalOfOriginalAccounts: accountsMock.length,
    };
  },
});

export const tools = {
  createNewCategory: createNewCategoryTool,
  listCategoryActions: listCategoryActionsTool,
  deleteCategory: deleteCategoryTool,
  listCategories: listCategoriesTool,
  
  createNewCreditCard: createNewCreditCardTool,
  listCreditCardActions: listCreditCardActionsTool,
  deleteCreditCard: deleteCreditCardTool,
  listCreditCards: listCreditCardsTool,
  createNewAccount: createNewAccountTool,
  listAccountActions: listAccountActionsTool,
  deleteAccount: deleteAccountTool,
  listAccounts: listAccountsTool,
  filterAccounts: filterAccountsTool,
};
