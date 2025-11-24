"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

import { ItemAnalyticsResponse } from "@/types/analytics.types";

type ChartRow = {
  month: string;
  [key: string]: string | number;
};

interface ItemsAnalyticsChartProps {
  data: ItemAnalyticsResponse;
}

const ItemsAnalyticsChart: React.FC<ItemsAnalyticsChartProps> = ({ data }) => {
  const { points, groupBy, metric } = data;

  const hasMonth = groupBy.includes("month");
  const hasCategory = groupBy.includes("category");

  if (!hasMonth || !hasCategory) {
    return (
      <div className="p-4 rounded-md bg-muted text-sm">
        Por enquanto este gráfico suporta apenas agrupamento por{" "}
        <strong>mês</strong> e <strong>categoria</strong>.
      </div>
    );
  }

  const categories = Array.from(
    new Set(points.map((p) => p.categoryName || "Categoria"))
  );

  const months = Array.from(
    new Set(points.map((p) => p.month || ""))
  ).sort();

  const chartData: ChartRow[] = months.map((m) => {
    const row: ChartRow = { month: m };

    categories.forEach((c) => {
      const match = points.find(
        (p) => (p.month || "") === m && (p.categoryName || "Categoria") === c
      );
      row[c] = match ? match.value : 0;
    });

    return row;
  });

  const chartConfig = categories.reduce(
    (acc, cat, index) => {
      acc[`cat_${index}`] = {
        label: cat,
      };
      return acc;
    },
    {} as any
  );

  const metricLabelMap: Record<string, string> = {
    total_expenses: "Gastos (R$)",
    total_incomes: "Receitas (R$)",
    balance: "Saldo (R$)",
    count_items: "Quantidade de lançamentos",
  };

  const yAxisLabel = metricLabelMap[metric] || "Valor";

  return (
    <div className="w-full">
      <h3 className="text-base font-semibold mb-1">
        Evolução mensal por categoria
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Este gráfico mostra a evolução da métrica selecionada por categoria ao
        longo dos meses.
      </p>

      <ChartContainer config={chartConfig} className="w-full">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" fontSize={10} />
          <YAxis
            fontSize={10}
            tickFormatter={(v) =>
              typeof v === "number" ? v.toLocaleString("pt-BR") : ""
            }
          />
          <RechartsTooltip content={<ChartTooltipContent />} />
          <RechartsLegend content={<ChartLegendContent />} />

          {categories.map((cat, index) => (
            <Line
              key={cat}
              type="monotone"
              dataKey={cat}
              strokeWidth={2}
              dot={false}
              name={cat}
            />
          ))}
        </LineChart>
      </ChartContainer>

      <p className="text-[11px] text-muted-foreground mt-2">
        Eixo X: Mês | Eixo Y: {yAxisLabel}
      </p>
    </div>
  );
};

export default ItemsAnalyticsChart;
