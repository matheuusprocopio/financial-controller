import { categoriesMock } from "@/data/categoriesMock";
import { accountsMock } from "@/data/accountsMock";
import { tool } from "ai";
import { z } from "zod";

export const createNewCategoryTool = tool({
  description: "Create or add a new category or sub-category to user",
  inputSchema: z.object({
    name: z.string(),
  }),

  execute: async ({ name }) => {
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
    name: z.string(),
  }),

  execute: async ({ name }) => {
    const categories = categoriesMock;

    return {
      name,
      categories,
      totalOfCategories: categories.length,
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
  createNewAccount: createNewAccountTool,
  listAccountActions: listAccountActionsTool,
  deleteAccount: deleteAccountTool,
  listAccounts: listAccountsTool,
  filterAccounts: filterAccountsTool,
};
