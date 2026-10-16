import { tool } from "ai";
import { z } from "zod";
import { listAccounts } from "@/utils/services/accounts";
import { listGoals, getGoalById } from "@/utils/services/goals";
import { getSessionId } from "@/utils/server-cookies";
import { GoalType } from "@/types/goal.types";
import { createRequestError } from "@/utils/requestProvider";
import { isRequestError, resolveIsoDate } from "./shared";

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
