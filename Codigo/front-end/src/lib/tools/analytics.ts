import { tool } from "ai";
import { z } from "zod";
import { getSessionId } from "@/utils/server-cookies";
import { calculateItemsAnalytics, ItemAnalyticsRequest } from "@/utils/services/Analytics/itemsAnalytics";
import { ItemAnalyticsResponse } from "@/types/analytics.types";
import { createRequestError } from "@/utils/requestProvider";
import { isRequestError } from "./shared";

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
