import { creditCardsMock } from "@/data/creditCardsMock";
import { tool } from "ai";
import { z } from "zod";

import { listCategoriesPaginated } from "@/utils/services/categories";
import { listAccountsPaginated, getAccountById } from "@/utils/services/accounts";
import { listGoals, getGoalById } from "@/utils/services/goals";
import { getSessionId } from "@/utils/server-cookies";

import { AccountType } from "@/types/account.type";
import { GoalType } from "@/types/goal.types";
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
    return {
      title,
      description,
      accountId,
      targetAmount,
      deadline,
    };
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
        return { goalId, title, description, accountId, targetAmount, deadline, error: goalResp };
      }

      const goal = goalResp;
      return {
        goalId: goal.id,
        title: title ?? goal.title,
        description: description ?? goal.description,
        accountId: accountId ?? goal.accountId,
        targetAmount: targetAmount ?? goal.targetAmount,
        deadline: deadline ?? goal.deadline,
      };
    } catch (error) {
      return {
        goalId,
        title,
        description,
        accountId,
        targetAmount,
        deadline,
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

  createNewGoal: createNewGoalTool,
  editGoal: editGoalTool,
  listGoalActions: listGoalActionsTool,
  deleteGoal: deleteGoalTool,
  listGoals: listGoalsTool,
};
