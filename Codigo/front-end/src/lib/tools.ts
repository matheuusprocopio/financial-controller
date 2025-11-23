import { creditCardsMock } from "@/data/creditCardsMock";
import { tool } from "ai";
import { z } from "zod";
import { listCategoriesPaginated } from "@/utils/services/categories";
import {
  getAccountById,
  listAccountsPaginated,
} from "@/utils/services/accounts";
import { AccountType } from "@/types/account.type";
import { RequestError } from "@/utils/requestProvider";

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
      const userId = "7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e";
      const resp = await listCategoriesPaginated(
        userId,
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
        userId,
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
      const resp = await getAccountById(accountId);

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
      const userId = "7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e";
      const resp = await listAccountsPaginated(userId, { page: 1, size: 10 });

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
        userId,
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
      const userId = "7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e";
      const resp = await listAccountsPaginated(userId, { page: 1, size: 10 });

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
        userId,
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
