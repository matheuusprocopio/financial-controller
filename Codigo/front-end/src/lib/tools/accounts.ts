import { tool } from "ai";
import { z } from "zod";
import { listAccountsPaginated, getAccountById } from "@/utils/services/accounts";
import { getSessionId } from "@/utils/server-cookies";
import { AccountType } from "@/types/account.type";
import { createRequestError } from "@/utils/requestProvider";
import { isRequestError } from "./shared";

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
