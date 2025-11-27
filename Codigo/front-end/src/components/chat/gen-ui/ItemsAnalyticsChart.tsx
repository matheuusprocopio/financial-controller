"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  type TooltipProps,
} from "recharts";

import { ChartContainer, ChartLegendContent } from "@/components/ui/chart";
import { ItemAnalyticsResponse } from "@/types/analytics.types";

export type ChartMode = "gastos" | "receita" | "patrimonio";

type ChartRow = {
  monthKey: string;
  monthLabel: string;
  total: number;
  [key: string]: string | number;
};

type ChartComputationState = {
  status: "no-data" | "error" | "unsupported" | "empty" | "ready";
  resolvedMode: ChartMode;
  chartData: ChartRow[];
  chartConfig: Record<string, { label: string; color: string }>;
  activeCategories: string[];
  error?: ItemAnalyticsResponse["error"];
};

interface ItemsAnalyticsChartProps {
  data?: ItemAnalyticsResponse;
  mode?: ChartMode;
}

const MODE_LABEL: Record<ChartMode, { title: string; description: string }> = {
  gastos: {
    title: "Evolução mensal por categoria",
    description:
      "Veja a distribuição dos seus gastos por categoria em cada mês e identifique os períodos de maior consumo.",
  },
  receita: {
    title: "Origem mensal das receitas",
    description:
      "Acompanhe quais fontes de renda contribuíram para cada mês e como o total evoluiu ao longo do tempo.",
  },
  patrimonio: {
    title: "Composição mensal do patrimônio",
    description:
      "Analise como cada classe de ativos participa do patrimônio total mês a mês.",
  },
};

const METRIC_TO_MODE: Record<string, ChartMode> = {
  total_expenses: "gastos",
  total_incomes: "receita",
  balance: "patrimonio",
};

const RAW_VALUE_PREFIX = "__raw__";
const STACK_TOTAL_KEY = "__stackTotal";

const COLOR_PALETTE = [
  "#7C3AED", "#0EA5E9", "#F97316", "#10B981", "#F43F5E",
  "#14B8A6", "#FACC15", "#6366F1", "#EC4899", "#A855F7",
];

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const getMonthLabel = (monthKey: string) => {
  if (!monthKey) return "";
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
};

const ItemsAnalyticsChart: React.FC<ItemsAnalyticsChartProps> = ({ data, mode }) => {
  const {
    status,
    resolvedMode,
    chartData,
    chartConfig,
    activeCategories,
    error,
  } = useMemo<ChartComputationState>(() => {
    const metric = data?.metric ?? "";
    const computedMode = mode ?? METRIC_TO_MODE[metric] ?? "gastos";

    if (!data) {
      return {
        status: "no-data" as const,
        resolvedMode: computedMode,
        chartData: [],
        chartConfig: {},
        activeCategories: [],
      };
    }

    if (data.error) {
      return {
        status: "error" as const,
        resolvedMode: computedMode,
        error: data.error,
        chartData: [],
        chartConfig: {},
        activeCategories: [],
      };
    }

    const points = data.points ?? [];
    const groupBy = data.groupBy ?? [];

    const hasMonth = groupBy.includes("month");
    const hasCategory = groupBy.includes("category");

    if (!hasMonth || !hasCategory) {
      return {
        status: "unsupported" as const,
        resolvedMode: computedMode,
        chartData: [],
        chartConfig: {},
        activeCategories: [],
      };
    }

    if (points.length === 0) {
      return {
        status: "empty" as const,
        resolvedMode: computedMode,
        chartData: [],
        chartConfig: {},
        activeCategories: [],
      };
    }

    const allCategories = Array.from(new Set(points.map((p) => p.categoryName || "Outros")));
    const usedCategories = new Set<string>();

    const uniqueMonths = Array.from(new Set(points.map((p) => p.month || "")))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    const processedData = uniqueMonths.map((m) => {
      const row: ChartRow = {
        monthKey: m,
        monthLabel: getMonthLabel(m),
        total: 0,
        [STACK_TOTAL_KEY]: 0,
      };

      const pointsInMonth = points.filter((p) => (p.month || "") === m);

      allCategories.forEach((cat) => {
        const value = pointsInMonth
          .filter((p) => (p.categoryName || "Outros") === cat)
          .reduce((sum, item) => sum + (item.value ?? 0), 0);

        const normalizedValue = computedMode === "patrimonio" ? Math.abs(value) : value;

        if (normalizedValue !== 0) {
          usedCategories.add(cat);
        }

        row[cat] = normalizedValue;
        row.total += value;
        
        const stackVal = computedMode === "patrimonio" ? Math.abs(value) : Math.max(value, 0);
        row[STACK_TOTAL_KEY] = (row[STACK_TOTAL_KEY] as number) + stackVal;
        
        row[`${RAW_VALUE_PREFIX}${cat}`] = value;
      });

      return row;
    });

    const finalCategories = allCategories.filter((c) => usedCategories.has(c));
    const catsToShow = finalCategories.length > 0 ? finalCategories : allCategories;

    const config = catsToShow.reduce<Record<string, { label: string; color: string }>>((acc, cat, index) => {
      acc[cat] = {
        label: cat,
        color: COLOR_PALETTE[index % COLOR_PALETTE.length],
      };
      return acc;
    }, {});

    return {
      status: "ready" as const,
      resolvedMode: computedMode,
      chartData: processedData,
      chartConfig: config,
      activeCategories: catsToShow,
    };
  }, [data, mode]);

  if (status === "no-data") {
    return (
      <div className="p-4 rounded-md bg-muted text-sm">
        Ainda não recebemos os dados deste gráfico. Tente novamente em alguns instantes.
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-sm">
        Não foi possível carregar o gráfico ({error.error.status}).{" "}
        <span className="font-medium">{error.error.message}</span>
      </div>
    );
  }

  if (status === "unsupported") {
    return (
      <div className="p-4 rounded-md bg-muted text-sm">
        Por enquanto este gráfico suporta apenas agrupamento por <strong>mês</strong> e <strong>categoria</strong>.
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="p-4 rounded-md bg-muted text-sm">
        Não encontramos dados suficientes para montar este gráfico. Tente ajustar o período ou os filtros.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) return null;

    const row = payload[0]?.payload as ChartRow;
    const stackTotal = (row?.[STACK_TOTAL_KEY] as number) ?? 0;
    
    const headerTotal = resolvedMode === "patrimonio" ? row?.total : stackTotal;

    return (
      <div className="rounded-md border bg-background p-3 text-xs shadow-md z-50">
        <div className="mb-1 flex items-center justify-between text-sm font-semibold gap-4">
          <span>{row?.monthLabel ?? label}</span>
          <span>{formatCurrency(headerTotal)}</span>
        </div>

        {resolvedMode === "patrimonio" && (
          <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Volume movimentado (abs)</span>
            <span>{formatCurrency(stackTotal)}</span>
          </div>
        )}

        <div className="space-y-1 mt-2">
          {payload.map((entry) => {
            const key = entry.dataKey as string;
            const rawValue = (row?.[`${RAW_VALUE_PREFIX}${key}`] as number) ?? 0;
            
            const displayValue = resolvedMode === "patrimonio" ? rawValue : (entry.value ?? 0);
            
            const contributionAbs = resolvedMode === "patrimonio" ? Math.abs(rawValue) : (entry.value ?? 0);
            const percentage = stackTotal > 0 ? (contributionAbs / stackTotal) * 100 : 0;

            return (
              <div key={key} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-sm shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground truncate max-w-[120px]">
                    {chartConfig[key]?.label ?? key}
                  </span>
                </div>
                <div className="text-right font-medium whitespace-nowrap">
                  {formatCurrency(displayValue)}
                  <span className="ml-1.5 text-[10px] text-muted-foreground w-8 inline-block text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-1">{MODE_LABEL[resolvedMode].title}</h3>
        <p className="text-xs text-muted-foreground">
          {MODE_LABEL[resolvedMode].description}
        </p>
      </div>

      <ChartContainer config={chartConfig} className="w-full min-h-[300px]">
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
          <XAxis 
            dataKey="monthLabel" 
            fontSize={10} 
            axisLine={false}
            tickLine={false} 
            tickMargin={10}
            minTickGap={30}
          />
          <YAxis
            fontSize={10}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => typeof v === "number" ? v.toLocaleString("pt-BR", { notation: "compact" }) : ""}
          />
          <RechartsTooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: "var(--muted)", opacity: 0.3 }} 
          />
          <RechartsLegend content={<ChartLegendContent />} />

          {activeCategories.map((cat, index) => (
            <Bar
              key={cat}
              dataKey={cat}
              stackId="total"
              name={chartConfig[cat].label}
              fill={chartConfig[cat].color}
              radius={index === activeCategories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              barSize={32}
            />
          ))}
        </BarChart>
      </ChartContainer>

      <div className="mt-4 flex flex-col gap-1">
        <p className="text-[11px] text-muted-foreground">
          Eixo X: Mês | Eixo Y: valores em reais (R$). As barras mostram o total mensal e as cores a contribuição.
        </p>
        {resolvedMode === "patrimonio" && (
          <p className="text-[11px] text-muted-foreground">
            * No gráfico de patrimônio, exibimos o peso absoluto para visualização. 
            Valores negativos reduzem o saldo, positivos aumentam.
          </p>
        )}
      </div>
    </div>
  );
};

export default ItemsAnalyticsChart;